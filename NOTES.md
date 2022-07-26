# Development Notes

## Tree Shaking / Side Effects

The code is not side effect free, because **on import dynamic stuff happens**. For example the logging is set up looking out for some ENV variables.
