# weather-app-assets

Weather app assets. Use as git submodule in the main app.

Add to new weather-app project

```
cd src
git submodule add https://github.com/[organization]/weather-app-assets assets
git commit -m "Added assets as a submodule"
```

Clone existing weather-app project with submodule

```
git clone --recurse-submodules https://github.com/[organization]/weather-app
```