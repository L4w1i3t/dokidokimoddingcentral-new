init python:
    import math
    
    class RGBGlitch(renpy.Displayable):
        def __init__(self, child, amount=5, speed=0.5):
            super(RGBGlitch, self).__init__()
            self.child = renpy.displayable(child)
            self.amount = amount
            self.speed = speed
            self.time = 0
        
        def render(self, width, height, st, at):
            child_render = renpy.render(self.child, width, height, st, at)
            render = renpy.Render(width, height)
            
            self.time += self.speed * renpy.game.preferences.transitions
            offset = int(math.sin(self.time) * self.amount)
            
            # Create RGB channel offsets
            render.blit(child_render, (0, 0))
            red = renpy.render(self.child, width, height, st, at)
            green = renpy.render(self.child, width, height, st, at)
            blue = renpy.render(self.child, width, height, st, at)
            
            render.blit(red, (offset, 0), focus=False, main=False)
            render.blit(green, (0, 0), focus=False, main=False)
            render.blit(blue, (-offset, 0), focus=False, main=False)
            
            renpy.redraw(self, 0)
            return render

# Example usage
image sayori_glitched = RGBGlitch("sayori 1a")

# Then in script
# show sayori_glitched