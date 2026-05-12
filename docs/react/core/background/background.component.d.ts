import { ReactNode } from '../../../../../node_modules/.pnpm/react@18.3.1/node_modules/react';
import { Property } from 'csstype';
export interface BackgroundProps {
    className?: string;
    children?: ReactNode;
    image?: Property.BackgroundImage;
    imageUrl?: string;
    gradiant?: Property.BackgroundImage;
    position?: Property.BackgroundPosition;
    size?: Property.BackgroundSize;
    attachment?: 'fixed' | 'local' | 'scroll';
    minHeight?: Property.MinHeight;
    color?: string;
}
export declare const Background: ({ children, image, imageUrl, gradiant, position, size, attachment, className, minHeight, color, }: BackgroundProps) => JSX.Element;
//# sourceMappingURL=background.component.d.ts.map