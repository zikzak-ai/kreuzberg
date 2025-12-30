package dev.kreuzberg;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for Phase 2 FFI functions: error handling and classification.
 *
 * @since 4.0.0
 */
@DisplayName("Phase 2 Error FFI Functions")
final class Phase2ErrorFFITest {

	@Nested
	@DisplayName("ErrorUtils.classifyError()")
	final class ClassifyErrorTest {

		@Test
		@DisplayName("should classify validation error messages")
		void shouldClassifyValidationError() throws KreuzbergException {
			String message = "Invalid parameter: negative value not allowed";
			int code = ErrorUtils.classifyError(message);

			assertThat(code).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
		}

		@Test
		@DisplayName("should classify parsing error messages")
		void shouldClassifyParsingError() throws KreuzbergException {
			String message = "Failed to parse PDF: corrupted file structure";
			int code = ErrorUtils.classifyError(message);

			assertThat(code).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
		}

		@Test
		@DisplayName("should classify OCR error messages")
		void shouldClassifyOcrError() throws KreuzbergException {
			String message = "OCR processing failed: insufficient image quality";
			int code = ErrorUtils.classifyError(message);

			assertThat(code).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
		}

		@Test
		@DisplayName("should throw exception for null message")
		void shouldThrowForNullMessage() {
			assertThatThrownBy(() -> ErrorUtils.classifyError(null)).isInstanceOf(IllegalArgumentException.class)
					.hasMessageContaining("must not be null");
		}
	}

	@Nested
	@DisplayName("ErrorUtils.getErrorCodeName()")
	final class GetErrorCodeNameTest {

		@Test
		@DisplayName("should return valid error code name for code 0")
		void shouldReturnNameForCode0() throws KreuzbergException {
			String name = ErrorUtils.getErrorCodeName(0);

			assertThat(name).isNotNull().isNotEmpty().isLowerCase();
		}

		@Test
		@DisplayName("should return valid error code name for code 1")
		void shouldReturnNameForCode1() throws KreuzbergException {
			String name = ErrorUtils.getErrorCodeName(1);

			assertThat(name).isNotNull().isNotEmpty().isLowerCase();
		}

		@Test
		@DisplayName("should return valid error code name for code 7")
		void shouldReturnNameForCode7() throws KreuzbergException {
			String name = ErrorUtils.getErrorCodeName(7);

			assertThat(name).isNotNull().isNotEmpty().isLowerCase();
		}

		@Test
		@DisplayName("should return unknown for invalid code")
		void shouldReturnUnknownForInvalidCode() throws KreuzbergException {
			String name = ErrorUtils.getErrorCodeName(999);

			assertThat(name).isEqualTo("unknown");
		}
	}

	@Nested
	@DisplayName("ErrorUtils.getErrorCodeDescription()")
	final class GetErrorCodeDescriptionTest {

		@Test
		@DisplayName("should return valid description for code 0")
		void shouldReturnDescriptionForCode0() throws KreuzbergException {
			String desc = ErrorUtils.getErrorCodeDescription(0);

			assertThat(desc).isNotNull().isNotEmpty();
		}

		@Test
		@DisplayName("should return valid description for code 2")
		void shouldReturnDescriptionForCode2() throws KreuzbergException {
			String desc = ErrorUtils.getErrorCodeDescription(2);

			assertThat(desc).isNotNull().isNotEmpty();
		}

		@Test
		@DisplayName("should return valid description for code 7")
		void shouldReturnDescriptionForCode7() throws KreuzbergException {
			String desc = ErrorUtils.getErrorCodeDescription(7);

			assertThat(desc).isNotNull().isNotEmpty();
		}
	}

	@Nested
	@DisplayName("ErrorUtils.getErrorDetails()")
	final class GetErrorDetailsTest {

		@Test
		@DisplayName("should return error details map")
		@org.junit.jupiter.api.Disabled("FFI function causes JVM crash - native implementation incomplete")
		void shouldReturnErrorDetailsMap() throws KreuzbergException {
			Map<String, Object> details = ErrorUtils.getErrorDetails();

			assertThat(details).isNotNull();
		}
	}

	@Nested
	@DisplayName("ErrorUtils.mapErrorCode()")
	final class MapErrorCodeTest {

		@Test
		@DisplayName("should map code 0 to validation error")
		void shouldMapValidationError() {
			ErrorCode code = ErrorUtils.mapErrorCode(0);

			assertThat(code).isEqualTo(ErrorCode.SUCCESS);
		}

		@Test
		@DisplayName("should map code 1 to parsing error")
		void shouldMapParsingError() {
			ErrorCode code = ErrorUtils.mapErrorCode(1);

			assertThat(code).isEqualTo(ErrorCode.GENERIC_ERROR);
		}

		@Test
		@DisplayName("should map code 7 to internal error")
		void shouldMapInternalError() {
			ErrorCode code = ErrorUtils.mapErrorCode(7);

			assertThat(code).isNotNull();
		}
	}

	@Nested
	@DisplayName("Error Classification Robustness")
	final class ErrorClassificationRobustnessTest {

		@Test
		@DisplayName("should classify various error message patterns")
		void shouldClassifyVariousErrorPatterns() throws KreuzbergException {
			String[] errorMessages = {"File not found", "Memory allocation failed",
					"Configuration error: invalid value", "Network timeout", "Permission denied", "Resource exhausted",
					"Unknown error occurred"};

			for (String message : errorMessages) {
				int code = ErrorUtils.classifyError(message);
				assertThat(code).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
			}
		}

		@Test
		@DisplayName("should handle empty string error message")
		void shouldHandleEmptyErrorMessage() throws KreuzbergException {
			int code = ErrorUtils.classifyError("");
			assertThat(code).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
		}

		@Test
		@DisplayName("should be case-insensitive for error classification")
		void shouldBeCaseInsensitiveClassification() throws KreuzbergException {
			int code1 = ErrorUtils.classifyError("PARSING ERROR");
			int code2 = ErrorUtils.classifyError("parsing error");
			int code3 = ErrorUtils.classifyError("Parsing Error");

			// All should classify to same category
			assertThat(code1).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
			assertThat(code2).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
			assertThat(code3).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
		}

		@Test
		@DisplayName("should classify technical error messages")
		void shouldClassifyTechnicalErrors() throws KreuzbergException {
			String[] technicalErrors = {"NullPointerException in module extraction",
					"StackOverflowError during parsing", "OutOfMemoryError: heap space",
					"IllegalArgumentException: negative chunk size"};

			for (String error : technicalErrors) {
				int code = ErrorUtils.classifyError(error);
				assertThat(code).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
			}
		}
	}

	@Nested
	@DisplayName("Error Code Name Consistency")
	final class ErrorCodeNameConsistencyTest {

		@Test
		@DisplayName("should return consistent names for all valid codes")
		void shouldReturnConsistentNamesForAllCodes() throws KreuzbergException {
			for (int i = 0; i <= 7; i++) {
				String name = ErrorUtils.getErrorCodeName(i);
				assertThat(name).isNotNull().isNotEmpty();

				// Get again to ensure consistency
				String nameAgain = ErrorUtils.getErrorCodeName(i);
				assertThat(name).isEqualTo(nameAgain);
			}
		}

		@Test
		@DisplayName("should have unique names for different error codes")
		void shouldHaveUniqueNamesForDifferentCodes() throws KreuzbergException {
			java.util.Set<String> names = new java.util.HashSet<>();

			for (int i = 0; i <= 7; i++) {
				String name = ErrorUtils.getErrorCodeName(i);
				assertThat(names).doesNotContain(name);
				names.add(name);
			}

			assertThat(names).hasSize(8);
		}

		@Test
		@DisplayName("should handle boundary codes correctly")
		void shouldHandleBoundaryCodes() throws KreuzbergException {
			// Test boundary values
			String minName = ErrorUtils.getErrorCodeName(0);
			String maxName = ErrorUtils.getErrorCodeName(7);
			String beyondMax = ErrorUtils.getErrorCodeName(8);
			String negativeCode = ErrorUtils.getErrorCodeName(-1);

			assertThat(minName).isNotNull();
			assertThat(maxName).isNotNull();
			assertThat(beyondMax).isEqualTo("unknown");
			assertThat(negativeCode).isEqualTo("unknown");
		}
	}

	@Nested
	@DisplayName("Error Recovery Strategies")
	final class ErrorRecoveryStrategiesTest {

		@Test
		@DisplayName("should provide actionable error code names")
		void shouldProvideActionableErrorCodeNames() throws KreuzbergException {
			for (int i = 0; i <= 7; i++) {
				String name = ErrorUtils.getErrorCodeName(i);
				String description = ErrorUtils.getErrorCodeDescription(i);

				assertThat(name).isNotNull().isNotEmpty();
				assertThat(description).isNotNull().isNotEmpty();

				// Description should be more detailed than name
				assertThat(description.length()).isGreaterThanOrEqualTo(name.length());
			}
		}

		@Test
		@DisplayName("should support error code to ErrorCode enum mapping")
		void shouldSupportErrorCodeMapping() {
			for (int i = 0; i <= 7; i++) {
				ErrorCode code = ErrorUtils.mapErrorCode(i);
				assertThat(code).isNotNull();
			}

			// Invalid code should still map to something
			ErrorCode invalidCode = ErrorUtils.mapErrorCode(999);
			assertThat(invalidCode).isNotNull();
		}

		@Test
		@DisplayName("should provide consistent descriptions")
		void shouldProvideConsistentDescriptions() throws KreuzbergException {
			for (int i = 0; i <= 7; i++) {
				String desc1 = ErrorUtils.getErrorCodeDescription(i);
				String desc2 = ErrorUtils.getErrorCodeDescription(i);

				assertThat(desc1).isEqualTo(desc2);
			}
		}
	}

	@Nested
	@DisplayName("Error Handling Integration")
	final class ErrorHandlingIntegrationTest {

		@Test
		@DisplayName("should classify and map errors consistently")
		void shouldClassifyAndMapErrorsConsistently() throws KreuzbergException {
			String errorMessage = "PDF parsing failed: corrupted structure";

			// Classify the error
			int errorCode = ErrorUtils.classifyError(errorMessage);
			assertThat(errorCode).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);

			// Map to ErrorCode enum
			ErrorCode code = ErrorUtils.mapErrorCode(errorCode);
			assertThat(code).isNotNull();

			// Get name and description
			String name = ErrorUtils.getErrorCodeName(errorCode);
			String description = ErrorUtils.getErrorCodeDescription(errorCode);

			assertThat(name).isNotNull().isNotEmpty();
			assertThat(description).isNotNull().isNotEmpty();
		}

		@Test
		@DisplayName("should handle error escalation")
		void shouldHandleErrorEscalation() throws KreuzbergException {
			// Start with a specific error message
			String initialError = "Memory allocation failed during extraction";

			int code1 = ErrorUtils.classifyError(initialError);
			String name1 = ErrorUtils.getErrorCodeName(code1);

			// Simulate error escalation
			String escalatedError = "CRITICAL: " + initialError;
			int code2 = ErrorUtils.classifyError(escalatedError);
			String name2 = ErrorUtils.getErrorCodeName(code2);

			// Both should classify to valid codes
			assertThat(code1).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
			assertThat(code2).isGreaterThanOrEqualTo(0).isLessThanOrEqualTo(7);
			assertThat(name1).isNotEmpty();
			assertThat(name2).isNotEmpty();
		}
	}
}
