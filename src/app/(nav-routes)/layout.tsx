import React, { PropsWithChildren } from 'react';
import Navigation from '@/components/ui/Navigation';

const layout = ({ children }: PropsWithChildren) => <Navigation>{children}</Navigation>;

export default layout;
