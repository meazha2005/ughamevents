# UGHAM Events PHP Image Upload Backend

This directory contains the standalone PHP backend designed to be hosted at:
`https://ztoitech.com/events/uc/`

## Deployment Instructions:
1. Log in to cPanel for `ztoitech.com`.
2. Open **File Manager** and navigate to `public_html/events/uc/` (create `events` and `uc` folders if they don't exist).
3. Upload `upload.php` and `.htaccess` into `public_html/events/uc/`.
4. Create an `uploads` directory at `public_html/events/uc/uploads/` and set permissions to `755` or `775`.
5. The API will be accessible at:
   `https://ztoitech.com/events/uc/upload.php`

## API Details:
- **Method**: `POST`
- **Body**: `multipart/form-data`
  - `file`: The image file (JPG, PNG, WEBP, GIF, SVG, up to 10MB)
  - `type`: `events` | `profiles` | `general` (optional, default: `general`)
- **Response**:
```json
{
  "success": true,
  "url": "https://ztoitech.com/events/uc/uploads/events/events_1731057400_abc123.jpg",
  "filename": "events_1731057400_abc123.jpg",
  "type": "events",
  "mime": "image/jpeg",
  "size": 150240,
  "message": "Image uploaded successfully."
}
```
