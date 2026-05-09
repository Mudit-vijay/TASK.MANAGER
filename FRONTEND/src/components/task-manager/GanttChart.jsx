import React from 'react';

const GanttChart = ({ scheduledTasks }) => {
  if (!scheduledTasks || scheduledTasks.length === 0) {
    return <div className="text-gray-400 italic">No schedule to display. Try running the optimizer.</div>;
  }

  // Find the total time range
  const maxTime = Math.max(...scheduledTasks.map(t => t.endTime), 24);
  const timeUnits = Array.from({ length: maxTime + 1 }, (_, i) => i);

  return (
    <div className="w-full overflow-x-auto bg-gray-900 p-4 rounded-lg border border-gray-700 mt-6">
      <div className="min-w-[800px]">
        {/* Time Header */}
        <div className="flex mb-2">
          <div className="w-40 flex-shrink-0"></div>
          <div className="flex flex-1 border-b border-gray-700">
            {timeUnits.map(unit => (
              <div key={unit} className="flex-1 text-center text-xs text-gray-500 border-l border-gray-800">
                {unit}h
              </div>
            ))}
          </div>
        </div>

        {/* Task Rows */}
        <div className="space-y-2">
          {scheduledTasks.map((task) => (
            <div key={task.id} className="flex items-center group">
              {/* Task Label */}
              <div className="w-40 flex-shrink-0 pr-4 text-sm font-medium text-gray-300 truncate" title={task.text}>
                {task.text}
              </div>

              {/* Timeline Track */}
              <div className="relative flex-1 h-8 bg-gray-800/50 rounded overflow-hidden border border-gray-800">
                {/* Task Bar */}
                <div
                  className="absolute h-full flex items-center justify-center text-[10px] font-bold text-gray-900 transition-all duration-500 rounded-sm shadow-lg"
                  style={{
                    left: `${(task.startTime / maxTime) * 100}%`,
                    width: `${((task.endTime - task.startTime) / maxTime) * 100}%`,
                    backgroundColor: task.color || '#3db9d3'
                  }}
                >
                  <span className="truncate px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.startTime}-{task.endTime}h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#ff4d4d] rounded-sm"></div> Crucial</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#ffa64d] rounded-sm"></div> High</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#ffff4d] rounded-sm"></div> Medium</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#4dff4d] rounded-sm"></div> Low</div>
      </div>
    </div>
  );
};

export default GanttChart;
