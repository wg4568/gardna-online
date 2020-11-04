# Tank Sprite
# username, angle, red, green, blue

LABEL FONT "bold 32px Comic Sans MS"

PUSH ARG1           # rotate to angle
ROTATE

PUSH 180            # light grey fill color
PUSH 180
PUSH 180
PUSH 1
SET_FILL_COLOR

PUSH 5              # 5px stroke width
SET_LINE_WIDTH

BEGIN_PATH          # draw turret
PUSH 0
PUSH -20
PUSH -60
PUSH 40
RECT
FILL
STROKE

PUSH ARG2           # set player color
PUSH ARG3
PUSH ARG4
PUSH 1
SET_FILL_COLOR

BEGIN_PATH          # draw tank body
PUSH 0
PUSH 0
PUSH 40
PUSH 0
PUSH PI
PUSH 2
MULTIPLY
ARC
FILL
STROKE

PUSH ARG1           # restore angle
PUSH -1
MULTIPLY
ROTATE

PUSH FONT           # set font
SET_FONT

PUSH 2              # 2px line width
SET_LINE_WIDTH

PUSH ARG0           # draw username
PUSH ARG0
MEASURE_TEXT
PUSH -2
DIVIDE
PUSH 70
FILL_TEXT
STROKE_TEXT