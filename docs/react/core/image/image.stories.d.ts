import { ImageProps } from './image.model';
declare const _default: {
    title: string;
    component: ({ url, alt, height, width, opacity, fit, ...rest }: ImageProps) => JSX.Element | null;
    argTypes: {
        blur: {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        brightness: {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        contrast: {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        grayscale: {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        'hue-rotate': {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        invert: {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        opacity: {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        saturate: {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        sepia: {
            control: {
                type: string;
                min: number;
                max: number;
                step: number;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
            description: string;
        };
        url: {
            control: {
                type: string;
            };
            table: {
                summary: string;
            };
        };
        fit: {
            options: string[];
            control: {
                type: string;
            };
            table: {
                type: {
                    summary: string;
                };
                defaultValue: {
                    summary: string;
                };
            };
        };
        height: {
            control: {
                type: string;
            };
        };
        width: {
            control: {
                type: string;
            };
        };
    };
    parameters: {
        layout: string;
    };
};
export default _default;
export declare const ImagePlayground: {
    (args: ImageProps): import("react/jsx-runtime").JSX.Element;
    args: Partial<ImageProps>;
};
//# sourceMappingURL=image.stories.d.ts.map