import React from 'react';
import { Helmet } from 'react-helmet';
import { FastOnlineApplication } from '@/components/fast-online-application';

export default function FastOnlineApplicationPage() {
  return (
    <>
      <Helmet>
        <title>Fast Online Application | Realty.AI</title>
        <meta name="description" content="Complete your mortgage pre-approval application quickly with our AI-powered document processing system." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
        <div className="container pt-8 pb-16">
          <FastOnlineApplication />
        </div>
      </div>
    </>
  );
}