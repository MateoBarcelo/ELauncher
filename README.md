# ELauncher

This is a custom minecraft launcher starter-kit to create your own private launchers for events or distributions.
Currently it's only focused to developers.

- Current mod loaders: Forge, Fabric
- Manage your own launcher settings
- Create your own launcher UI
- Player whitelist

This was built in top of x-minecraft-launcher-core, follow https://github.com/Voxelum/minecraft-launcher-core-node

## Notes:
This is not a launcher with a mod or instance manager, because the purpose of this is that players only runs your own configured instance served by a storage service (If you want to use another storage that's not R2, you'll need to implement the solution)
