'use client';

import * as React from 'react';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
  orientation: TabsProps['orientation'];
}

const TabsContext = React.createContext<TabsContextProps | null>(null);

export const Tabs = React.forwardRef<
  HTMLDivElement,
  TabsProps
>((props, ref) => {
  const {
    className,
    children,
    defaultValue,
    value,
    onValueChange,
    orientation = 'horizontal',
    ...restProps
  } = props;

  const controlledValue = value;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? ''
  );
  const isControlled = controlledValue !== undefined;
  const tabsValue = isControlled ? controlledValue : uncontrolledValue;
  const setValue = isControlled
    ? (v: string) => onValueChange?.(v)
    : setUncontrolledValue;

  return (
    <div
      ref={ref}
      className={`relative w-${orientation ==='vertical' ? 'flex' : 'block'}`}
      {...restProps}
    >
      <TabsContext.Provider
        value={{ value: tabsValue, onValueChange: setValue, orientation }}
      >
      {children}
      </TabsContext.Provider>
    </div>
  )
});
Tabs.displayName = 'Tabs';

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList = React.forwardRef<
  HTMLUListElement,
  TabsListProps
>((props, ref) => {
  const { className, children, ...restProps } = props;
  const { orientation } = React.useContext(TabsContext)!!;
  return (
    <ul
      ref={ref}
      role="tablist"
      className={`flex flex-wrap ${orientation === 'vertical' ? 'flex-col' : 'space-x-1'}`}
      {...restProps}
    >
      {children}
    </ul>
  );
});
TabsList.displayName = 'TabsList';

interface TabsTriggerProps {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  value: string;
}

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>((props, ref) => {
  const { className, children, disabled, value, ...restProps } = props;
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }
  const { value: tabsValue, onValueChange, orientation } = context;
  const isActive = tabsValue === value;

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onValueChange(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
        transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${isActive
          ? 'border-b-2 border-primary-foreground bg-background/50'
          : 'hover:bg-accent-blue/10 text-accent-blue/50 hover:text-accent-blue'}
        ${orientation === 'vertical' ? 'border-r-0 border-b border-b-0' : 'border-b-0'}`}
      {...restProps}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps {
  className?: string;
  children: React.ReactNode;
  value: string;
}

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps
>((props, ref) => {
  const { className, children, value, ...restProps } = props;
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }
  const { value: tabsValue } = context;
  const isActive = tabsValue === value;

  return (
    <div
      ref={ref}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={`mt-2 block ${!isActive ? 'hidden' : 'block'} max-w-full`}
      {...restProps}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = 'TabsContent';