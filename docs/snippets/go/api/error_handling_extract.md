```go title="Go"
package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

func main() {
	client := &http.Client{}

	file, _ := io.ReadAll(nil) // Replace with actual file read
	resp, err := client.Post("http://localhost:8000/extract", "application/pdf", nil)
	if err != nil {
		log.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]string
		json.NewDecoder(resp.Body).Decode(&errResp)
		log.Fatalf("error: %s: %s", errResp["error_type"], errResp["message"])
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	println("Success:", result["content"].(string))
}
```
