# Starfield #

3D starfield simulation. Like the good old Windows screensaver, but in JS and improved.

To start the animation, just call this function, and (optionally) pass some options to it to configure the animation to your liking. For it to work you should have a canvas object in your document with id #stars.

```javascript
warpLaunch({
    'max_particles': 500,
    'speed': 50,
    'step': 2,
    'interactive': true,
    'color': true,
});
```

### What does each option mean ###

* max_particles: The amount of stars that appear onscreen at one given moment
* speed: How fast stars move towards the screen
* step: If interactive mode is on, how much the speed changes when the mouse wheel is scrolled
* interactive: If enabled, allows to control the speed of the simulation with the scroll wheel
* color: Stars are colored instead of white if enabled
