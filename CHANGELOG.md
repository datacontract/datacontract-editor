# CHANGELOG

## 2024-07-19

- Better sharing support. When clicking "File -> Share", the Data Contract creates a shareable URL with the Data Contract YAML encoded in the URL. Previously, we only used base64 encoding, but it turned out that may lead to some URLs that are too long. To solve this, we gzip before encoding with base64. This allows for much large data contracts to be shared.
