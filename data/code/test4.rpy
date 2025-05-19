init -10 python:
    # Initialize save metadata dict if not exists
    if not hasattr(persistent, 'save_metadata'):
        persistent.save_metadata = {}
    
    def save_extra_data(slot, key, value):
        """Save additional data to a save slot"""
        if slot not in persistent.save_metadata:
            persistent.save_metadata[slot] = {}
            
        persistent.save_metadata[slot][key] = value
        renpy.save_persistent()
        
    def get_save_data(slot, key, default=None):
        """Retrieve additional data from a save slot"""
        if slot not in persistent.save_metadata:
            return default
            
        return persistent.save_metadata[slot].get(key, default)
        
    # Example: Record chapter and location when saving
    def save_with_metadata(slot):
        # Store metadata
        chapter = getattr(store, 'current_chapter', 'Unknown')
        location = getattr(store, 'current_location', 'Unknown')
        save_extra_data(slot, 'chapter', chapter)
        save_extra_data(slot, 'location', location)
        
        # Proceed with the actual save
        renpy.save(slot)
        
    # Extend the save screen to display metadata
    def display_save_metadata(slot):
        chapter = get_save_data(slot, 'chapter', 'Unknown Chapter')
        location = get_save_data(slot, 'location', 'Unknown Location')
        return "{} - {}".format(chapter, location)