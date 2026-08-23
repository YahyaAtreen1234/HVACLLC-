# Team photos

Drop staff portraits here. Until a photo exists, that person's card shows their
initials on a brand colour — deliberate-looking rather than broken.

## Filenames

Use the person's name, lower case, hyphenated:

```
team-maria-alvarez.jpg
team-derek-shaw.jpg
```

Predictable names mean swapping a placeholder for a real photo is a drag and
drop plus one line in the data file — never a hunt through components.

## What the photo should be

- **Square.** The cards crop to 1:1; a wide photo loses the sides.
- **800×800 or larger.** Smaller than that looks soft on a phone screen, which
  is where most of these are seen.
- **JPEG** for photographs. PNG is for graphics with flat colour and does no
  favours to a portrait.
- **Face roughly centred**, head and shoulders. Cropping happens from the edges.

## Wiring one up

Two ways, and the second needs no developer:

**In the admin panel** — `/admin/team`, edit the person, use the photo field.
The upload is stored and served automatically, so nothing here needs touching.

**In code** — put the file here, then set `image.src` in
[`src/data/team.ts`](../../../src/data/team.ts):

```ts
image: {
  src: "/images/team/team-maria-alvarez.jpg",
  alt: "Maria Alvarez, Service Manager at NorthStar HVAC",
  width: 800,
  height: 800,
},
```

Keep the `alt` text specific — name, role, company. It is read aloud to anyone
using a screen reader and is one of the few places a search engine learns who
works here.

## Permission

Ask before publishing someone's face. A photo of a named employee on a public
website is personal data, and "I did not know it was going up" is a bad
conversation to have afterwards.
