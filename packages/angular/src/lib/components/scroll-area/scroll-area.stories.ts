import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { UniButtonComponent } from '../button/button.component';
import { UniTextComponent } from '../text/text.component';
import { UniScrollAreaComponent as ScrollArea } from './scroll-area.component';

type StoryType = ScrollArea & { ngContent?: string };

const meta: Meta<StoryType> = {
  title: 'Components/Scroll Area',
  component: ScrollArea,
  decorators: [
    moduleMetadata({
      imports: [UniTextComponent, UniButtonComponent],
    }),
  ],
  argTypes: {},
  render: (args) => {
    const { ngContent, ...props } = args;
    return {
      props,
      template: `
        <div scroll-area ${argsToTemplate(props)} #scrollArea>
          <button size="sm" text-button variant="ghost" symbolLeft="arrow_downward" (click)="scrollArea.scrollToBottom()">Scroll to bottom</button>
          ${ngContent}
          <button size="sm" text-button variant="ghost" symbolLeft="arrow_upward" (click)="scrollArea.scrollToTop()">Back to top</button>
        </div>
      `,
    };
  },
};

export default meta;
type Story = StoryObj<StoryType>;

export const Primary: Story = {
  args: {
    border: 'quaternary',
    color: 'tertiary-surface',
    height: 200,
    ngContent: `
      <Text typeface="headline-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</Text>
      <Text typeface="body-1-long">
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quis facere debitis ullam, quae quidem, impedit
              culpa nam
              repellat in voluptatibus esse ab harum, hic? Aliquam nesciunt voluptates repellendus assumenda labore.
            </p>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Porro quos voluptate doloribus. Optio unde
              inventore, tempore
              nemo repellat expedita! Quod, accusamus nobis iure. Aliquam quibusdam, nemo explicabo ipsum provident
              asperiores.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat, qui, rem! Debitis cum maiores iste,
              possimus!
              Obcaecati accusamus eaque expedita quo soluta quis, repudiandae similique, veritatis repellendus facere
              suscipit!
              Et!</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum doloremque repellat praesentium quae et
              consectetur
              iure quos porro, provident voluptates reprehenderit a. Accusamus ut, quaerat asperiores blanditiis
              voluptate, sint
              facilis.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus beatae inventore nobis esse
              temporibus
              exercitationem
              eos illo minima non magnam, provident sit doloribus maiores odio in animi quidem unde. Perferendis.</p>

      </Text>


    `,
  },
};
