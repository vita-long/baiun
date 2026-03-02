import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * 仪表板页面组件
 * 显示应用的主页面内容
 */
const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-4">仪表板</h1>
          <p className="text-muted-foreground">欢迎来到应用的主页面！</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;