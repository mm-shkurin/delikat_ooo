# Components

Tokens live in `tokens.css`. The mockup uses these classes and no raw colours.

Button
  variants  primary, quiet, ghost
  sizes     md 40px, lg 48px
  states    default, hover, active, focus-visible (2px ring, accent), disabled
  tokens    primary: bg accent, text on-accent, radius md, font sm/700
  a11y      real button, visible focus, disabled stays readable
  used on   S01, S02, S03, S04

Segment
  variants  delivery, pickup
  states    pressed, not pressed, focus-visible
  tokens    pressed: bg badge, text on-badge, radius pill
  used on   S01

Chip
  variants  category, address empty, address set
  states    current, hover, focus-visible
  tokens    current: bg badge, text on-badge, radius pill
  used on   S01

Card
  variants  dish, set (compare price)
  states    default
  tokens    surface, radius lg, shadow card, quiet price button
  a11y      price control is a button named with the dish
  used on   S01

Dialog
  variants  dish, address, auth
  states    open, closed
  tokens    surface, radius lg, shadow pop
  a11y      role=dialog, aria-modal, labelled, Escape closes, focus moves inside
  used on   S02, S03, S05

Drawer
  variants  cart empty, cart filled
  states    open, closed
  tokens    surface, shadow pop
  used on   S04

Dock
  variants  need address, empty cart, has total
  states    default, focus-visible
  tokens    accent bar, on-accent text
  used on   S01

Toast
  variants  cookie
  states    visible, dismissed
  used on   S01
