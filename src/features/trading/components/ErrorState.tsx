interface ErrorStateProps {
  readonly message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex min-h-96 items-center justify-center text-sm text-chart-red">
      {message}
    </div>
  );
}
