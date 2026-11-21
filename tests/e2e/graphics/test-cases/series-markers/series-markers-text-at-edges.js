function runTestCase(container) {
	const chart = window.chart = LightweightCharts.createChart(container, {
		layout: { attributionLogo: false },
		timeScale: {
			fixLeftEdge: true,
			fixRightEdge: true,
		},
	});

	const mainSeries = chart.addSeries(LightweightCharts.CandlestickSeries);

	const data = [
		{ time: '2019-01-01', open: 20, high: 25, low: 18.564, close: 24 },
		{ time: '2019-01-02', open: 24, high: 35, low: 22, close: 32 },
		{ time: '2019-01-03', open: 32, high: 45, low: 30, close: 42 },
		{ time: '2019-01-04', open: 42, high: 55, low: 40, close: 52 },
		{ time: '2019-01-05', open: 52, high: 65, low: 50, close: 62 },
		{ time: '2019-01-06', open: 62, high: 75, low: 60, close: 72 },
		{ time: '2019-01-07', open: 72, high: 85, low: 70, close: 82 },
		{ time: '2019-01-08', open: 82, high: 99.999, low: 80, close: 95 },
	];
	mainSeries.setData(data);

	// marker text of the first and last bars should stay fully visible
	// instead of being cut off by the pane edges (issue #1595)
	LightweightCharts.createSeriesMarkers(
		mainSeries,
		[
			{ time: data[0].time, position: 'belowBar', color: 'red', shape: 'arrowUp', text: 'All-time low: 18.564' },
			{ time: data[data.length - 1].time, position: 'aboveBar', color: 'green', shape: 'arrowDown', text: 'All-time high: 99.999' },
		]
	);

	chart.timeScale().fitContent();
}
