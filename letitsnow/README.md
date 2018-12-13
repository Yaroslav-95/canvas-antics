# Let It Snow #

It is presicely what you imagine.

To start the animation, just call this function, and (optionally) pass some options to it to configure the animation to your liking. For it to work you should have a canvas object in your document with id #snow.

```javascript
letItSnow({
    'max_particles': 400,
    'base_speed': 100,
    'max_xspeed': 150,
    'max_tradius': 10,
    'max_tduration': 5000,
    'interactive': true,
});
```

### What does each option mean ###

* max_particles: The amount of snowflakes drawn onscreen
* base_speed: The base speed at which snowflakes should fall (pixels per second)
* max_xspeed: Maximum speed of "wind" or horizontal speed of flakes (also pix/s)
* max_tradius: How much should be the maximum that the snowflakes should swing from left to right (or turbulence).
* max_tduration: How fast each snowflake should swing (milliseconds)
* interactive: Should the position of the mouse affect the wind

Happy holidays 2018 and happy 2019!
