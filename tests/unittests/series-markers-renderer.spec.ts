/* eslint-disable @typescript-eslint/no-floating-promises */
import { expect } from 'chai';
import { BitmapCoordinatesRenderingScope } from 'fancy-canvas';
import { describe, it } from 'node:test';

import { Coordinate } from '../../src/model/coordinate';
import { TimePointIndex } from '../../src/model/time-data';
import {
	SeriesMarkerRendererDataItem,
	SeriesMarkersRenderer,
} from '../../src/plugins/series-markers/renderer';

interface FillTextCall {
	text: string;
	x: number;
	y: number;
}

class FakeCtx {
	public readonly fillTextCalls: FillTextCall[] = [];
	public textBaseline: CanvasTextBaseline = 'alphabetic';
	public font: string = '';
	public fillStyle: string | CanvasGradient | CanvasPattern = '';

	public measureText(text: string): TextMetrics {
		return { width: text.length * 10 } as unknown as TextMetrics;
	}

	public fillText(text: string, x: number, y: number): void {
		this.fillTextCalls.push({ text, x, y });
	}

	public save(): void {}
	public restore(): void {}
	public scale(): void {}
}

class TestRenderer extends SeriesMarkersRenderer {
	public drawForTest(ctx: FakeCtx, width: number): void {
		this._drawImpl({
			context: ctx as unknown as CanvasRenderingContext2D,
			horizontalPixelRatio: 1,
			verticalPixelRatio: 1,
			mediaSize: { width, height: 300 },
			bitmapSize: { width, height: 300 },
		} as unknown as BitmapCoordinatesRenderingScope);
	}
}

function itemWithText(x: number, content: string): SeriesMarkerRendererDataItem {
	return {
		time: 0 as TimePointIndex,
		x: x as Coordinate,
		y: 100 as Coordinate,
		size: 0,
		shape: 'circle',
		color: 'red',
		internalId: 0,
		externalId: 'marker-0',
		text: {
			content,
			x: 0 as Coordinate,
			y: 80 as Coordinate,
			width: 0,
			height: 0,
		},
	};
}

function drawItem(item: SeriesMarkerRendererDataItem, width: number = 400): { ctx: FakeCtx; renderer: TestRenderer } {
	const renderer = new TestRenderer();
	renderer.setParams(12, 'sans-serif', 'normal');
	renderer.setData({ items: [item], visibleRange: { from: 0, to: 1 } });
	const ctx = new FakeCtx();
	renderer.drawForTest(ctx, width);
	return { ctx, renderer };
}

describe('SeriesMarkersRenderer text position', () => {
	// the fake context measures every character as 10px wide,
	// so 'abcdefghij' is rendered 100px wide

	it('centers the text on the marker away from the edges', () => {
		const item = itemWithText(200, 'abcdefghij');
		const { ctx } = drawItem(item);

		expect(ctx.fillTextCalls).to.have.lengthOf(1);
		expect(ctx.fillTextCalls[0].x).to.be.equal(150);
		expect(item.text?.x).to.be.equal(150);
	});

	it('keeps the text fully visible at the left edge (issue #1595)', () => {
		const item = itemWithText(10, 'abcdefghij');
		const { ctx } = drawItem(item);

		expect(ctx.fillTextCalls[0].x).to.be.equal(0);
		expect(item.text?.x).to.be.equal(0);
	});

	it('keeps the text fully visible at the right edge (issue #1595)', () => {
		const item = itemWithText(395, 'abcdefghij');
		const { ctx } = drawItem(item);

		expect(ctx.fillTextCalls[0].x).to.be.equal(300);
		expect(item.text?.x).to.be.equal(300);
	});

	it('does not pull the text into the pane for a marker that is off-screen to the left', () => {
		const item = itemWithText(-20, 'abcdefghij');
		const { ctx } = drawItem(item);

		expect(ctx.fillTextCalls[0].x).to.be.equal(-70);
	});

	it('does not pull the text into the pane for a marker that is off-screen to the right', () => {
		const item = itemWithText(420, 'abcdefghij');
		const { ctx } = drawItem(item);

		expect(ctx.fillTextCalls[0].x).to.be.equal(370);
	});

	it('aligns the text to the left edge when it is wider than the pane', () => {
		const item = itemWithText(25, 'abcdefghij');
		const { ctx } = drawItem(item, 50);

		expect(ctx.fillTextCalls[0].x).to.be.equal(0);
	});

	it('hit-tests the text where it is drawn at the edge', () => {
		const item = itemWithText(10, 'abcdefghij');
		const { renderer } = drawItem(item);

		expect(renderer.hitTest(95, 80)).to.not.equal(null);
	});
});
