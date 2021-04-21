const svg= d3.select('svg');
const width=+svg.attr('width');
const height=+svg.attr('height');
const projection = d3.geoNaturalEarth1();
const geoPath = d3.geoPath();
const g = svg.append('g');
const padding=200;
const colorScale = d3.scaleLinear();
const tooltip = d3.select('body')
                	.append('div')
			.attr('id', 'tooltip');
 
const loadAndProcessData = ()  =>
	Promise
		.all([
			d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'),
			d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json')
		])
		.then(([eduData, topoJSONdata]) => {
			
			const rowFromId = eduData.reduce((accumulator, d) => {
				accumulator[d.fips] = d;
				return accumulator;
			}, {});

			const counties = topojson.feature(topoJSONdata, topoJSONdata.objects.counties);

			counties.features.forEach(d=> {
				Object.assign(d.properties, rowFromId[d.id]);
			});
			return counties;
		});


svg.call(d3.zoom().on('zoom', () => {
	g.attr('transform', d3.event.transform);
}));


loadAndProcessData().then(counties=> {
	// our colour range, which will map data values to colours
	const color = d3.scaleQuantize()
    		.domain([0, d3.max(counties.features, (d) => d.properties.bachelorsOrHigher)])
    		.range(d3.schemeBlues[7]);

	// create a colorLegend function. 
	const colorLegend = svg.append("g")
        	.attr("id", "legend")
        	.attr("transform", "translate("+(width-padding/2-)+", -10)")
		//.attr("transform", "translate("+padding+", "+(height-padding/2)+")")
        	.text("Key");
	for (let x=0; x<90; x+=10) {
    		colorLegend.append('rect')
        		.attr('x', x*2)
        		.attr('width', 20)
        		.attr('height', 30)
        		.attr("fill", color(x));
		}     

	// Data join
	g.selectAll('path').data(counties.features)
		.enter().append('path')
			
			.attr('class', 'county')
			.attr('data-fips', d => d.properties.fips)
			.attr('data-education', d => d.properties.bachelorsOrHigher)
			.attr('d', geoPath)
			.attr('fill', d => color(d.properties.bachelorsOrHigher))
			.on('mouseover', (d)=>{
          			tooltip
					.attr('data-education', d.properties.bachelorsOrHigher)
					.html(d.properties.area_name + " " + d.properties.bachelorsOrHigher)
          				.style('left', d3.event.pageX +"px")
          				.style('top', d3.event.pageY+ "px")
          				.style('opacity', 0.9);
          		})
        		.on('mouseout', () => {
          			tooltip
          				.style('opacity', 0);
					
          				
        		})
			
	let legendScale = d3.scaleLinear()
		.domain([0 , d3.max(counties.features, (d) => d.properties.bachelorsOrHigher)])
  		.range([0 , 180]).nice();  
		//.nice makes the ends of the scale easier on the eye
	let legendAxis = d3.axisBottom(legendScale)
		.tickSizeOuter(0);

	colorLegend.append("g")
      		.attr("id", "legend-axis")
      		.attr("transform", "translate(0,30)")
      		.call(legendAxis); 

});












	
