# Define the message screen
screen message_screen(messages):
    style_prefix "message"
    
    frame:
        background "phone_bg"
        padding (20, 20)
        
        viewport:
            mousewheel True
            draggable True
            yinitial 1.0
            
            vbox:
                spacing 10
                
                for message in messages:
                    $ sender = message.get("sender", "")
                    $ text = message.get("text", "")
                    $ time = message.get("time", "")
                    
                    hbox:
                        # Right-align for player messages
                        xalign 0.0 if sender != "player" else 1.0
                        
                        vbox:
                            xalign 0.0 if sender != "player" else 1.0
                            spacing 5
                            
                            if sender and sender != "player":
                                text sender style "message_sender"
                                
                            frame:
                                style "message_bubble_them" if sender != "player" else "message_bubble_you"
                                text text
                            
                            if time:
                                text time size 12 xalign 0.0 if sender != "player" else 1.0

# Example setup
init python:
    def create_message(sender, text, time=""):
        return {"sender": sender, "text": text, "time": time}

# Example usage
label phone_conversation:
    $ messages = []
    $ messages.append(create_message("Sayori", "Hey, are you there?", "9:41 AM"))
    
    call screen message_screen(messages)
    
    $ messages.append(create_message("player", "Yeah, what's up?", "9:42 AM"))
    
    call screen message_screen(messages)