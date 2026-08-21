# Front-and-center wedding video

Put the customer first-dance video **here** and it appears on the home and weddings pages automatically.

## Fastest path (file)

Save the video as one of these names in this folder:

- `wedding-first-dance.mp4`  ← preferred
- `wedding-dance.mp4`
- `first-dance.mp4`
- `wedding-first-dance.webm`

Keep it under ~40 MB for phones. Then deploy.

## Or paste a link

Edit `public/site-media.json`:

```json
{
  "weddingVideo": {
    "src": "https://www.youtube.com/watch?v=VIDEO_ID",
    "poster": "images/wedding-couple.jpeg",
    "title": "Watch a first dance",
    "caption": "A wedding dance Edyta built for a real couple."
  }
}
```

YouTube, youtu.be, Vimeo, or a direct `.mp4` URL all work.
