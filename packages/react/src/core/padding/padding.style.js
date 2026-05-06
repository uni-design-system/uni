export function Padding(size, apply) {
    const amount = 16;
    const unit = 'px';
    const PaddingMap = {
        top: {
            paddingTop: amount + unit
        },
        bottom: {
            paddingBottom: amount + unit
        },
        left: {
            paddingLeft: amount + unit
        },
        right: {
            paddingRight: amount + unit
        },
        vertical: {
            paddingTop: amount + unit,
            paddingBottom: amount + unit
        },
        horizontal: {
            paddingLeft: amount + unit,
            paddingRight: amount + unit
        },
        all: {
            padding: amount + unit
        }
    };
    return PaddingMap[apply];
}
