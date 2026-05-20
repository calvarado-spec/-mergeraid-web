const STEPS = ["Deal Info", "Questions", "Results"];

export default function FlowStepper({ activeStep }) {
  return (
    <div className="w-full bg-white border-b border-blue-50 py-4 print:hidden">
      <div className="max-w-sm mx-auto flex items-center justify-center px-4">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === activeStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                  i === activeStep ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="h-px w-14 mx-3 mb-5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
