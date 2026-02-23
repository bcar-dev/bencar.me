import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import React from 'react';

test('browser mode works', async () => {
    const screen = await render(<div>Hello from browser!</div>);
    await expect.element(screen.getByText('Hello from browser!')).toBeInTheDocument();
});
