# PubStudio Builder Demo

A very simple integration of `@pubstudio/editor`, `@pubstudio/renderer` that relies on `pubstudio-site-api` for site persistence.

### Prerequisites

- Install [PNPM](https://pnpm.io/)

### Setup

```bash
# Install packages
pnpm i
```

### Run Site API

Follow the instructions [here](https://github.com/samatechtw/pubstudio-builder/tree/main/backend/site-api) to run the backend.

### Run

```bash
# Dev server with hot-reloading
npm run serve

# Build for production/preview
npm run build

# Preview server, requires rebuild to see changes
npm preview builder-demo
```

### Environment

Configuration is provided from the environment, in development mode defaults are read in from `.env.development`

| Name                     | Description                               |
| ------------------------ | ----------------------------------------- |
| EXEC_ENV                 | Execution environment: dev, ci, stg, prod |
| VITE_SITE_FORMAT_VERSION | Site data format version                  |
| VITE_SITE_API_URL        | Site API backend URL                      |

**Docker**

Note: Dockerfile is not set up for hot reload.

```bash
docker build -t builder-demo -f ./Dockerfile --target=dev .

docker run -p 8080:80 builder-demo
```

## Develop

If working with a local version of `@pubstudio/builder`, replace the reference in `package.json` to something like:

```
    "@pubstudio/builder": "link:../pubstud/pubstudio-builder/dist/libs/feature-external",
```

Then, make sure to run `pnpm i` again.
