export const flex = { flex: 1 };
export const row = {
    display: 'flex',
    flex: 1,
    flexDirection: 'row'
};
export const column = {
    flex: 1,
    flexDirection: 'column'
};
export const alignTop = { alignItems: 'flex-start' };
export const alignCenter = { alignItems: 'center' };
export const alignBottom = { alignItems: 'flex-end' };
export const FlexVerticalAlignments = {
    top: alignTop,
    middle: alignCenter,
    bottom: alignBottom
};
export const justifyLeft = { justifyContent: 'flex-start' };
export const justifyCenter = { justifyContent: 'center' };
export const justifyRight = { justifyContent: 'flex-end' };
export const FlexHorizontalAlignments = {
    left: justifyLeft,
    center: justifyCenter,
    right: justifyRight
};
export const expand = { flexGrow: 1 };
export const fix = { flex: 0, flexGrow: 0 };
export const rowFlexItem = {
    flexGrow: 1
};
export const rowFixedItem = {
    flexGrow: 0
};
export const flexRowStart = {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
};
export const flexRowCenter = {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
};
export const flexRowEnd = {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
};
export const spaceBetween = {
    justifyContent: 'space-between'
};
export const flexRowSpaceBetween = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
};
export const flexRowSpaceAround = {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
};
export const spaceEvenly = {
    justifyContent: 'space-evenly'
};
export const flexRowSpaceEvenly = {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
};
export const flexColumnCenter = {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
};
export const flexColumnSpaceAround = {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
};
export const flexOff = {
    position: 'relative'
};
