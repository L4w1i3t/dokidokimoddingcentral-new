init python:
    def screen_seen(name):
        """Track if a screen has been seen before"""
        if not hasattr(persistent, "seen_screens"):
            persistent.seen_screens = {}
        
        is_first_time = name not in persistent.seen_screens
        persistent.seen_screens[name] = True
        renpy.save_persistent()
        
        return not is_first_time

# Example usage in dialogue script
label spooky_room:
    if screen_seen("spooky_room"):
        m "Wait... I feel like we've been here before."
        m "Why do you keep bringing us back here?"
    else:
        m "This room gives me the creeps. Let's not stay long."