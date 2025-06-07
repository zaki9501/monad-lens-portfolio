
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock } from "lucide-react";

const DAppInteractionTimeline = ({ data }) => {
  const getActivityColor = (type) => {
    switch (type) {
      case 'first_use': return '#10B981'; // green
      case 'heavy_use': return '#EF4444'; // red
      case 'regular_use': return '#3B82F6'; // blue
      case 'recent_use': return '#8B5CF6'; // purple
      default: return '#6B7280'; // gray
    }
  };

  const getActivityLabel = (type) => {
    switch (type) {
      case 'first_use': return 'First Use';
      case 'heavy_use': return 'Heavy Activity';
      case 'regular_use': return 'Regular Use';
      case 'recent_use': return 'Recent Activity';
      default: return 'Activity';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Interaction Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
            />
            <Line 
              type="monotone" 
              dataKey="interactions" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#A855F7' }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Timeline Events */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white mb-4">Key Events</h4>
          {data.timeline.map((event, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getActivityColor(event.type) }}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-medium">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: getActivityColor(event.type),
                      color: getActivityColor(event.type)
                    }}
                  >
                    {getActivityLabel(event.type)}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {event.interactions} interaction{event.interactions !== 1 ? 's' : ''} on this day
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DAppInteractionTimeline;
