import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import ImageZoom from '../ImageZoom.vue';

/** One `animate()` call: the element it ran on, its keyframes and options. */
interface AnimateCall {
    element: Element;
    keyframes: Keyframe[];
    options: KeyframeAnimationOptions;
}

const animateCalls: AnimateCall[] = [];
/** What the next animations' `finished` resolves with; replace it to hold an animation mid-way. */
let nextFinished: Promise<unknown> = Promise.resolve();
let prefersReducedMotion = false;

// jsdom lacks the modal dialog methods, image decoding, the Web Animations API and matchMedia. These stand-ins do
// what the browser does to the DOM: showModal() sets `open`, close() removes it and fires `close`, animations end
// when `nextFinished` resolves.
function stubBrowserApis(): void {
    const define = (target: object, name: string, value: unknown): void => {
        Object.defineProperty(target, name, { value, configurable: true, writable: true });
    };
    define(HTMLDialogElement.prototype, 'showModal', function (this: HTMLDialogElement): void {
        this.setAttribute('open', '');
    });
    define(HTMLDialogElement.prototype, 'close', function (this: HTMLDialogElement): void {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
    });
    define(HTMLImageElement.prototype, 'decode', (): Promise<void> => Promise.resolve());
    define(
        Element.prototype,
        'animate',
        function (
            this: Element,
            keyframes: Keyframe[],
            options: KeyframeAnimationOptions
        ): Partial<Animation> {
            animateCalls.push({ element: this, keyframes, options });
            return { finished: nextFinished as Promise<Animation>, cancel: (): void => {} };
        }
    );
    define(window, 'matchMedia', (query: string): Partial<MediaQueryList> => ({
        matches: query === '(prefers-reduced-motion: reduce)' && prefersReducedMotion,
    }));
}

function image(id: string): HTMLImageElement {
    return document.getElementById(id) as HTMLImageElement;
}

function pressKey(target: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}

/** Lets the async open (render, then decode) run to completion. */
async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
}

function zoomAnimation(): AnimateCall | undefined {
    return animateCalls.findLast(
        ({ element }) => element instanceof HTMLImageElement && element.closest('dialog')
    );
}

beforeEach(() => {
    animateCalls.length = 0;
    nextFinished = Promise.resolve();
    prefersReducedMotion = false;
    stubBrowserApis();
    document.body.innerHTML = `
        <div class="markdown-content">
            <img id="article" src="/shot.webp" alt="A screenshot">
            <a href="/elsewhere"><img id="linked" src="/linked.webp" alt="Linked"></a>
        </div>
        <img id="outside" src="/cover.webp" alt="Cover">`;
});

afterEach(() => {
    document.body.innerHTML = '';
    for (const [target, name] of [
        [HTMLDialogElement.prototype, 'showModal'],
        [HTMLDialogElement.prototype, 'close'],
        [HTMLImageElement.prototype, 'decode'],
        [Element.prototype, 'animate'],
        [window, 'matchMedia'],
    ] as const) {
        // Removing the stand-ins restores jsdom's own (missing) APIs.
        delete (target as unknown as Record<string, unknown>)[name];
    }
    vi.restoreAllMocks();
});

describe('ImageZoom', () => {
    it('marks article images as keyboard-focusable zoom buttons', () => {
        render(ImageZoom);
        expect(image('article')).toHaveAttribute('tabindex', '0');
        expect(image('article')).toHaveAttribute('role', 'button');
        expect(image('article')).toHaveAttribute('aria-label', 'Enlarge image: A screenshot');
        expect(image('outside')).not.toHaveAttribute('tabindex');
        expect(image('linked')).not.toHaveAttribute('tabindex');
    });

    it('opens the clicked article image in a dialog named after it', async () => {
        const { getByRole } = render(ImageZoom);
        await userEvent.click(image('article'));
        const dialog = getByRole('dialog', { name: 'A screenshot', hidden: true });
        await waitFor(() => expect(dialog).toHaveAttribute('open'));
        const zoomed = dialog.querySelector('img');
        expect(zoomed?.src).toBe(new URL('/shot.webp', document.baseURI).href);
        expect(zoomed).toHaveAttribute('alt', 'A screenshot');
    });

    it.each(['Enter', ' '])(
        'opens with %j on a focused image without the key doing anything else',
        async (key: string) => {
            const { getByRole } = render(ImageZoom);
            const event = pressKey(image('article'), key);
            await waitFor(() =>
                expect(getByRole('dialog', { hidden: true })).toHaveAttribute('open')
            );
            expect(event.defaultPrevented).toBe(true);
        }
    );

    it('ignores other keys', async () => {
        const { getByRole } = render(ImageZoom);
        const event = pressKey(image('article'), 'a');
        await settle();
        expect(getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
        expect(event.defaultPrevented).toBe(false);
    });

    it('ignores images outside the article body and lets linked images follow their link', async () => {
        const { getByRole } = render(ImageZoom);
        let linkClickPrevented: boolean | undefined;
        // Runs after ImageZoom's own document listener: records whether it blocked the link, then stops jsdom from
        // attempting a real navigation.
        const recordLinkClick = (event: MouseEvent): void => {
            linkClickPrevented = event.defaultPrevented;
            event.preventDefault();
        };
        document.addEventListener('click', recordLinkClick);
        await userEvent.click(image('outside'));
        await userEvent.click(image('linked'));
        document.removeEventListener('click', recordLinkClick);
        await settle();
        expect(getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
        expect(linkClickPrevented).toBe(false);
    });

    it('still opens when the image cannot be decoded', async () => {
        vi.spyOn(HTMLImageElement.prototype, 'decode').mockRejectedValue(
            new Error('EncodingError')
        );
        const { getByRole } = render(ImageZoom);
        await userEvent.click(image('article'));
        await waitFor(() => expect(getByRole('dialog', { hidden: true })).toHaveAttribute('open'));
    });

    it('zooms the image out of its place in the article', async () => {
        // Article image: 300 wide, centred at (250, 400). Zoomed image: 600 wide, centred at (700, 450).
        vi.spyOn(HTMLImageElement.prototype, 'getBoundingClientRect').mockImplementation(function (
            this: HTMLImageElement
        ): DOMRect {
            return (
                this.id === 'article'
                    ? { left: 100, top: 200, width: 300, height: 400 }
                    : { left: 400, top: 50, width: 600, height: 800 }
            ) as DOMRect;
        });
        render(ImageZoom);
        await userEvent.click(image('article'));
        await waitFor(() => expect(zoomAnimation()).toBeDefined());
        expect(zoomAnimation()?.keyframes).toEqual([
            { transform: 'translate(-450px, -50px) scale(0.5)' },
            { transform: 'none' },
        ]);
        expect(zoomAnimation()?.options.direction).toBe('normal');
    });

    it('zooms back into the article before closing', async () => {
        const { getByRole } = render(ImageZoom);
        const dialog = getByRole('dialog', { hidden: true });
        await userEvent.click(image('article'));
        await waitFor(() => expect(dialog).toHaveAttribute('open'));
        let finishClosing!: () => void;
        nextFinished = new Promise<void>((resolve) => (finishClosing = resolve));
        await userEvent.click(dialog);
        expect(zoomAnimation()?.options.direction).toBe('reverse');
        expect(dialog).toHaveAttribute('open');
        finishClosing();
        await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    });

    it('closes with the same animation on Esc', async () => {
        const { getByRole } = render(ImageZoom);
        const dialog = getByRole('dialog', { hidden: true });
        await userEvent.click(image('article'));
        await waitFor(() => expect(dialog).toHaveAttribute('open'));
        // Esc fires a cancelable `cancel` before the browser closes the dialog.
        const cancel = new Event('cancel', { cancelable: true });
        dialog.dispatchEvent(cancel);
        expect(cancel.defaultPrevented).toBe(true);
        expect(zoomAnimation()?.options.direction).toBe('reverse');
        await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    });

    it('opens and closes without animating when reduced motion is preferred', async () => {
        prefersReducedMotion = true;
        const { getByRole } = render(ImageZoom);
        const dialog = getByRole('dialog', { hidden: true });
        await userEvent.click(image('article'));
        await waitFor(() => expect(dialog).toHaveAttribute('open'));
        await userEvent.click(dialog);
        expect(dialog).not.toHaveAttribute('open');
        expect(animateCalls).toEqual([]);
    });

    it('closes with the close button and returns focus to the image', async () => {
        const { getByRole } = render(ImageZoom);
        const dialog = getByRole('dialog', { hidden: true });
        await userEvent.click(image('article'));
        await waitFor(() => expect(dialog).toHaveAttribute('open'));
        await userEvent.click(getByRole('button', { name: 'Close', hidden: true }));
        await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
        expect(document.activeElement).toBe(image('article'));
    });

    it('stops listening once unmounted', () => {
        const { unmount } = render(ImageZoom);
        unmount();
        // A leftover listener would still swallow Space and stop the page from scrolling.
        expect(pressKey(image('article'), ' ').defaultPrevented).toBe(false);
    });
});
