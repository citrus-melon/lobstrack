# Lobstrack
_Lobst track of an item? Worry not, Lobstrack will have your back!_

A simple-to-use, mobile/QR code-centric asset tracking platform desgined for everyday use at small scales such as FRC teams.

Built with Supabase, SvelteKit, and CapacitorJS.

## Purpose
The original goal of this project is to remove the friction in the process of updating an FRC team lab inventory, making it much more feasible to maintain its accuracy. QR codes bridge the gap between the "virtual world" of an inventory and the physical world, making it easier to make them reflect each other.

## Features
- [x] Organize and browse items in nested hierarchy (eg Shelf > Container > Example Item)
- [x] Scanning/generation of serialized QR code stickers
  - [x] Quickly identify and perform operations on items (such as updating location) by scanning
  - [ ] Double as "Property of / if found please return" labels
  - [ ] Personalize sticker format
- [ ] Attach notes, details, and files to items
- [ ] Allow integrations to provide additional item info
- [ ] Find items with full-text search
- [x] Easily share and reference items by link with web interface
- [ ] Track version history and audit log

## Developing

Clone this repository and install dependencies with `pnpm install`.

Set the following environment variables in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `PUBLIC_ROOT_ITEM_ID`

To start development server for web app:
```bash
pnpm dev
```

### Android
For Android development, also install Android Studio.

Build web app and copy it to Android project with
```bash
pnpm buildsync
```
Then open Android Studio with
```bash
pnpm cap open android
```
And run the app in Android Studio.

#### Live reload
For Android live reload, first start the development server with `--host` to make it accessible from other devices on your network.
```bash
pnpm dev --host
```
Then, set the `CAPACITOR_DEV_SERVER` environment variable to the development server, eg `http://192.168.x.x:5173` and run
```
pnpm buildsync
```
And run the app in Android Studio.
