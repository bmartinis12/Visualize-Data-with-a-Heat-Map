let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
let req = new XMLHttpRequest()

let baseTemp
let values

let xScale
let yScale

let minYear
let maxYear
let numberOfYears

let width = 1200
let height = 600
let padding = 60

let tooltip = d3.select('#tooltip')

let canvas = d3.select('#canvas')
canvas.attr('width', width)
canvas.attr('height', height)

let generateScales = () => {   
    
    minYear = d3.min(values, (d) => d['year'])
    maxYear = d3.max(values, (d) => d['year'])

    xScale = d3.scaleLinear()
                .domain([minYear, maxYear + 1]) // added one extra year just to extend the x axis to fit the cell block above- looks better only visual
                .range([padding, width - padding]) // range width will be padding & width - padding 

    yScale = d3.scaleTime()
                .domain([new Date(0,0,0,0,0,0,0), new Date(0,12,0,0,0,0,0)])
                .range([padding, height - padding])
}

let drawCell = () => {
    
    canvas.selectAll('rect')
            .data(values)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('fill', (d) => {
                variance = d['variance']
                if (variance <= -1) {
                    return 'SteelBlue'
                } else if (variance <= 0) {
                    return '#7efff5'
                } else if (variance < 1) {
                    return '#fad390'
                } else {
                    return 'orangered'
                }
            })
            .attr('data-year', (d) => d['year'])
            .attr('data-month', (d) => d['month'] - 1)
            .attr('data-temp', (d) => baseTemp + d['variance'])
            .attr('height', (height - (2 * padding)) / 12)
            .attr('y', (d) => {
                return yScale(new Date(0,d['month'] - 1), 0, 0, 0, 0, 0)
            })
            .attr('width', (d) => {
                numberOfYears = maxYear - minYear
                return (width - (2 * padding)) / numberOfYears
            })
            .attr('x', (d) => xScale(d['year']))
            .on('mouseover',(d) => {
                tooltip.transition()
                        .style('visibility', 'visible')

                        let monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                        ]

                tooltip.text(d['year'] + ' ' + monthNames[d['month'] - 1] + ' - ' + (baseTemp + d['variance']) + ' (' + d['variance'] + ')')

                tooltip.attr('data-year', d['year'])
            })

            .on('mouseout', (item) => {
                tooltip.transition()
                    .style('visibility', 'hidden')
            })
}

let drawAxes = () => {
    let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format('d')) // this method gets rid of comma in the year number 'd' will round up to decimels

    canvas.append('g')
            .attr('id', 'x-axis')
            .call(xAxis)
            .attr('transform', `translate(0, ${height - padding})`) // or ('transform', 'translate(0, ' + (height - padding) + ')')


    let yAxis = d3.axisLeft(yScale)
                    .tickFormat(d3.timeFormat('%B'))

    canvas.append('g')
            .attr('id', 'y-axis')
            .call(yAxis)
            .attr('transform', `translate(${padding}, 0)`)    // or 'translate(' + padding + ', 0) 
}

req.open('GET',url,true)
req.onload = () => {
    // console.log(req.responseText);
    let object = JSON.parse(req.responseText)
    baseTemp = object['baseTemperature']
    values = object['monthlyVariance']
    console.log(baseTemp)
    console.log(values)
    generateScales()
    drawCell()
    drawAxes()


}
req.send()
