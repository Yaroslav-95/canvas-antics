# DVD Screensaver #

Just like the good old days, when you paused that DVD movie for a long time, except now you can watch that sweet old screensaver on demand at any time.

To start the animation, just call the following function. You can omit passing the options object for the default experience. For it to work, you need to have a canvas object in your HTML document with id #dvd.

```javascript
playDVD({
    'speed': 200,
    'colors': [
        "#012fff",
        "#ff2190",
        "#ce21ff",
        "#ffec00",
        "#ff8702"
    ]
});
```
