import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RankingChartProps {
  title: string;
  data: any[];
  loading: boolean;
  color: string;
  borderColor: string;
  textColor: string;
  noDataMessage: string;
  metricLabel?: string;
  dataKey?: string;
}

const RankingChart: React.FC<RankingChartProps> = ({
  title,
  data,
  loading,
  color,
  borderColor,
  textColor,
  noDataMessage,
  metricLabel = "Cases",
  dataKey = "name",
}) => {
  const SkeletonBox = ({
    height = 16,
    width = "100%",
  }: {
    height?: number;
    width?: string;
  }) => (
    <div
      className="bg-gray-200 animate-pulse rounded"
      style={{ height: `${height}px`, width }}
    />
  );

  return (
    <div className="bg-white rounded-xl p-1 sm:p-2 shadow-sm border border-gray-100">
      <h4 className="text-sm text-gray-800 mb-1 font-bold line-clamp-2">
        {title}
      </h4>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBox key={index} height={18} width="90%" />
          ))}
        </div>
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
            barCategoryGap="15%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              horizontal
              vertical={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(v) => v.toLocaleString()}
              axisLine={{ stroke: "#d1d5db" }}
            />
            <YAxis
              type="category"
              dataKey={dataKey}
              tick={{
                fontSize: 9,
                fill: "#374151",
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      className={`bg-white border-2 ${borderColor} rounded-lg shadow-xl p-4 min-w-50`}
                    >
                      <div className={`font-bold ${textColor} mb-3 text-base`}>
                        {label}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">
                            {metricLabel}:
                          </span>
                          <span className="font-bold text-gray-900 text-base">
                            {data.value.toLocaleString()}
                          </span>
                        </div>
                        {data.open !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">
                              Open:
                            </span>
                            <span className="font-bold text-blue-600 text-base">
                              {data.open.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {data.closed !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">
                              Closed:
                            </span>
                            <span className="font-bold text-green-600 text-base">
                              {data.closed.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              fill={color}
              name={title}
              radius={[0, 4, 4, 0]}
              maxBarSize={25}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-gray-400 text-sm">{noDataMessage}</p>
        </div>
      )}
    </div>
  );
};

export default RankingChart;
