import React from 'react';
import HomePage from '@/components/pages/home/HomePage';

type Props = {
  params: Promise<{ resultId: string }>;
};

export default async function page({ params }: Props) {
  const { resultId } = await params;
  console.log(resultId);

  return <HomePage />;
}
