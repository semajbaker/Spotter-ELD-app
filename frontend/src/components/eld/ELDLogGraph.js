import { ResponsiveLine } from '@nivo/line';

/**
 * ELDLogGraph Component using Nivo Line Chart
 * Displays a visual timeline graph of duty status changes over 24 hours
 * Following FMCSA ELD regulations visual format
 */
const ELDLogGraph = ({ dailyLog }) => {
    // Status line mapping - Y-axis values
    const STATUS_MAP = {
        'OFF_DUTY': { yValue: 0, label: 'Off Duty', color: '#6B7280' },
        'SLEEPER': { yValue: 1, label: 'Sleeper Berth', color: '#F59E0B' },
        'DRIVING': { yValue: 2, label: 'Driving', color: '#EF4444' },
        'ON_DUTY': { yValue: 3, label: 'On Duty', color: '#3B82F6' },
    };

    /**
     * Transform log entries into Nivo line chart format
     * Creates a stepped line showing duty status changes throughout the day
     */
    const transformDataForNivo = () => {
        if (!dailyLog?.entries || dailyLog.entries.length === 0) {
            // Return empty data with 24-hour timeline starting at OFF_DUTY
            return [{
                id: 'Status',
                data: [
                    { x: 0, y: 0, status: 'Off Duty', time: '00:00' },
                    { x: 24, y: 0, status: 'Off Duty', time: '24:00' }
                ]
            }];
        }

        const dataPoints = [];
        
        // Sort entries by start time
        const sortedEntries = [...dailyLog.entries].sort((a, b) => 
            new Date(a.start_time) - new Date(b.start_time)
        );

        console.log('Processing entries:', sortedEntries);

        // Start at midnight with OFF_DUTY
        let currentHour = 0;
        let currentStatus = 0; // OFF_DUTY y-value

        // Add starting point at midnight
        dataPoints.push({
            x: 0,
            y: currentStatus,
            time: '00:00',
            status: 'Off Duty'
        });

        sortedEntries.forEach((entry, index) => {
            const startTime = new Date(entry.start_time);
            const endTime = new Date(entry.end_time);
            
            // Calculate hours from midnight (0-24)
            const startHour = startTime.getHours() + startTime.getMinutes() / 60;
            const endHour = endTime.getHours() + endTime.getMinutes() / 60;
            
            const statusInfo = STATUS_MAP[entry.status] || STATUS_MAP['OFF_DUTY'];
            const yValue = statusInfo.yValue;
            
            console.log(`Entry ${index}:`, entry.status, `from ${startHour.toFixed(2)} to ${endHour.toFixed(2)}, y=${yValue}`);

            // If there's a gap before this entry and status is changing, maintain previous status up to this point
            if (startHour > currentHour && yValue !== currentStatus) {
                // Only add a point if we're actually changing status
                // This extends the previous status up to the change point
            }

            // Only add a point if the status is actually changing
            if (yValue !== currentStatus) {
                dataPoints.push({
                    x: startHour,
                    y: yValue,
                    time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    status: statusInfo.label,
                    location: entry.location || '',
                    duration: entry.duration_minutes,
                    miles: entry.miles_driven || 0
                });
                currentStatus = yValue;
            }

            currentHour = endHour;
        });

        // Add final point at end of day if not already there
        if (currentHour < 24) {
            dataPoints.push({
                x: 24,
                y: currentStatus,
                time: '24:00',
                status: Object.values(STATUS_MAP).find(s => s.yValue === currentStatus)?.label || 'Off Duty'
            });
        }

        console.log('Final data points:', dataPoints);

        return [{
            id: 'Duty Status',
            data: dataPoints
        }];
    };

    const chartData = transformDataForNivo();

    /**
     * Custom tooltip to show duty status details
     */
    const CustomTooltip = ({ point }) => {
        const data = point.data;
        return (
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
                <div className="font-semibold mb-1">{data.status}</div>
                <div className="text-xs space-y-1">
                    <div>Time: {data.time}</div>
                    {data.duration > 0 && <div>Duration: {Math.floor(data.duration / 60)}h {data.duration % 60}m</div>}
                    {data.location && <div>Location: {data.location}</div>}
                    {data.miles > 0 && <div>Miles: {data.miles}</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6">
            <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Duty Status Timeline
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    24-Hour Graph showing driver duty status changes
                </p>
            </div>

            {/* Nivo Line Chart */}
            <div style={{ height: '300px' }}>
                <ResponsiveLine
                    data={chartData}
                    margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
                    xScale={{ 
                        type: 'linear',
                        min: 0,
                        max: 24
                    }}
                    yScale={{
                        type: 'linear',
                        min: -0.5,
                        max: 3.5,
                        stacked: false,
                        reverse: false
                    }}
                    curve="stepAfter"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Time (24-hour)',
                        legendOffset: 40,
                        legendPosition: 'middle',
                        format: (value) => {
                            const hour = Math.floor(value);
                            return `${hour.toString().padStart(2, '0')}:00`;
                        },
                        tickValues: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Duty Status',
                        legendOffset: -70,
                        legendPosition: 'middle',
                        format: (value) => {
                            const statusLabels = ['Off Duty', 'Sleeper', 'Driving', 'On Duty'];
                            return statusLabels[value] || '';
                        },
                        tickValues: [0, 1, 2, 3]
                    }}
                    colors={['#3B82F6']}
                    lineWidth={3}
                    pointSize={8}
                    pointColor={{ from: 'color' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'seriesColor' }}
                    enablePointLabel={false}
                    useMesh={true}
                    enableCrosshair={true}
                    crosshairType="cross"
                    tooltip={CustomTooltip}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: '#6B7280',
                                    fontSize: 11
                                }
                            },
                            legend: {
                                text: {
                                    fill: '#374151',
                                    fontSize: 12,
                                    fontWeight: 600
                                }
                            }
                        },
                        grid: {
                            line: {
                                stroke: '#E5E7EB',
                                strokeWidth: 1
                            }
                        },
                        crosshair: {
                            line: {
                                stroke: '#3B82F6',
                                strokeWidth: 1,
                                strokeOpacity: 0.5,
                                strokeDasharray: '6 6'
                            }
                        }
                    }}
                    enableArea={true}
                    areaOpacity={0.1}
                    enableSlices="x"
                />
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
                {Object.entries(STATUS_MAP).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                        <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: value.color }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">{value.label}</span>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <div className="text-xs text-red-700 dark:text-red-400">Driving</div>
                    <div className="text-lg font-bold text-red-900 dark:text-red-300">
                        {dailyLog.driving_hours}h
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-xs text-blue-700 dark:text-blue-400">On Duty</div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-300">
                        {dailyLog.on_duty_not_driving_hours}h
                    </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                    <div className="text-xs text-orange-700 dark:text-orange-400">Sleeper</div>
                    <div className="text-lg font-bold text-orange-900 dark:text-orange-300">
                        {dailyLog.sleeper_berth_hours}h
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-xs text-gray-700 dark:text-gray-400">Off Duty</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-300">
                        {dailyLog.off_duty_hours}h
                    </div>
                </div>
            </div>

            {/* Debug Info - Remove after testing */}
            <details className="mt-4 text-xs text-gray-500">
                <summary className="cursor-pointer">Debug Info (click to expand)</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto">
                    {JSON.stringify({
                        totalEntries: dailyLog?.entries?.length || 0,
                        entries: dailyLog?.entries?.map(e => ({
                            status: e.status,
                            start: new Date(e.start_time).toLocaleTimeString(),
                            end: new Date(e.end_time).toLocaleTimeString(),
                            duration: e.duration_minutes
                        })) || [],
                        chartDataPoints: chartData[0]?.data?.length || 0,
                        points: chartData[0]?.data || []
                    }, null, 2)}
                </pre>
            </details>
        </div>
    );
};

export default ELDLogGraph;