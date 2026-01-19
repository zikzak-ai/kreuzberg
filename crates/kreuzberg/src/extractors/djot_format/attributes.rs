//! Djot attribute parsing utilities.
//!
//! Handles parsing of Djot attributes from jotdown events and string syntax.

use std::collections::HashMap;

/// Parse jotdown attributes into our Attributes representation.
///
/// Converts jotdown's internal attribute representation to Kreuzberg's
/// standardized Attributes struct, handling IDs, classes, and key-value pairs.
pub fn parse_jotdown_attributes(attrs: &jotdown::Attributes) -> crate::types::Attributes {
    use crate::types::Attributes;
    use jotdown::AttributeKind;

    let mut id = None;
    let mut classes = Vec::new();
    let mut key_values = HashMap::new();

    for (kind, value) in attrs.iter() {
        match kind {
            AttributeKind::Id => {
                // Last ID wins if multiple are specified
                id = Some(value.to_string());
            }
            AttributeKind::Class => {
                classes.push(value.to_string());
            }
            AttributeKind::Pair { key } => {
                key_values.insert(key.to_string(), value.to_string());
            }
            AttributeKind::Comment => {
                // Comments are ignored in our representation
            }
        }
    }

    Attributes {
        id,
        classes,
        key_values,
    }
}

/// Parse djot attribute syntax from string: {.class #id key="value"}
#[allow(dead_code)]
pub fn parse_djot_attributes(attr_str: &str) -> crate::types::Attributes {
    use crate::types::Attributes;

    let mut attrs = Attributes {
        id: None,
        classes: Vec::new(),
        key_values: HashMap::new(),
    };

    // Simple parser for attribute syntax
    let tokens = attr_str.split_whitespace();

    for token in tokens {
        if let Some(class) = token.strip_prefix('.') {
            // Class
            attrs.classes.push(class.to_string());
        } else if let Some(id) = token.strip_prefix('#') {
            // ID
            attrs.id = Some(id.to_string());
        } else if token.contains('=') {
            // Key-value pair
            if let Some((key, value)) = token.split_once('=') {
                let clean_value = value.trim_matches('"').trim_matches('\'');
                attrs.key_values.insert(key.to_string(), clean_value.to_string());
            }
        }
    }

    attrs
}

/// Render attributes to djot attribute syntax.
///
/// Converts Kreuzberg's Attributes struct back to djot attribute syntax:
/// {.class #id key="value"}
pub fn render_attributes(attrs: &crate::types::Attributes) -> String {
    let mut parts = Vec::new();

    if let Some(ref id) = attrs.id {
        parts.push(format!("#{}", id));
    }

    for class in &attrs.classes {
        parts.push(format!(".{}", class));
    }

    for (key, value) in &attrs.key_values {
        parts.push(format!("{}=\"{}\"", key, value));
    }

    if parts.is_empty() {
        String::new()
    } else {
        format!("{{{}}}", parts.join(" "))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_render_attributes_with_all_parts() {
        let mut attrs = crate::types::Attributes {
            id: Some("my-id".to_string()),
            classes: vec!["class1".to_string(), "class2".to_string()],
            key_values: HashMap::new(),
        };
        attrs.key_values.insert("data-test".to_string(), "value".to_string());

        let rendered = render_attributes(&attrs);
        assert!(rendered.contains("#my-id"));
        assert!(rendered.contains(".class1"));
        assert!(rendered.contains(".class2"));
        assert!(rendered.contains("data-test"));
    }

    #[test]
    fn test_render_attributes_empty() {
        let attrs = crate::types::Attributes {
            id: None,
            classes: vec![],
            key_values: HashMap::new(),
        };

        let rendered = render_attributes(&attrs);
        assert_eq!(rendered, "");
    }
}
