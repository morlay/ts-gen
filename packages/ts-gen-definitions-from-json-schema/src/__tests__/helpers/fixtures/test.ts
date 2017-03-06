export default {
  "allOf": [
    {
      "$ref": "#/definitions/testBase"
    },
    {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        }
      }
    }
  ],
  "definitions": {
    "testBase": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        }
      }
    },
  }
}
