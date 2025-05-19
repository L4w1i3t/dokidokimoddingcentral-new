transform float_bounce:
    ease 0.1 yoffset -20
    ease 0.1 yoffset -15
    ease 0.1 yoffset -20
    ease 0.1 yoffset -15
    ease 0.1 yoffset -20
    ease 0.1 yoffset 0
    
image sayori_excited:
    "sayori 4q"
    zoom 1.0 xalign 0.5 yalign 1.0
    parallel:
        float_bounce
    parallel:
        ease 0.08 xoffset 2
        ease 0.08 xoffset 0
        repeat