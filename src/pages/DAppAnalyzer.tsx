
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const DAppAnalyzer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">DApp Analyzer</h1>
                <Badge variant="outline" className="border-purple-500 text-purple-300">
                  Beta
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Coming Soon Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-3xl mb-4">
                DApp Analytics Coming Soon
              </CardTitle>
              <p className="text-gray-300 text-lg">
                Advanced DApp interaction analysis and performance metrics
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Feature Preview Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Performance Metrics</h3>
                    <p className="text-gray-400 text-sm">
                      Track DApp performance, gas usage, and transaction success rates
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">User Analytics</h3>
                    <p className="text-gray-400 text-sm">
                      Analyze user behavior, retention, and interaction patterns
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Real-time Insights</h3>
                    <p className="text-gray-400 text-sm">
                      Get live data on DApp usage and blockchain interactions
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Stay tuned for powerful DApp analysis tools
                </p>
                <Link to="/">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DAppAnalyzer;
