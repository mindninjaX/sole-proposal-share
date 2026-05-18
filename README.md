# Sole — Proposal builder (review build)

Hosted at: **https://mindninjax.github.io/sole-proposal-share/**

Self-contained HTML of the proposal-flow prototype, served via GitHub Pages.
Source lives in [`mindninjaX/sole-practice-platform`](https://github.com/mindninjaX/sole-practice-platform).

## Updating

```sh
# In the source repo:
cd prototype && node build-shareable-proposal.js

# Then copy the artefact into this repo and push:
cp share-proposal.html ../path/to/sole-proposal-share/index.html
cd ../path/to/sole-proposal-share
git add index.html && git commit -m "Refresh share build" && git push
```

Pages rebuilds within ~30 seconds of each push.
