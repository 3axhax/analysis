import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
} from "@entities/counter";
import { Button } from "@shared/ui/Button";

export const Counter = () => {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div className="counter">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        Counter: <span className="text-gray-900 dark:text-white">{count}</span>
      </h2>
      <div className="counter-controls">
        <Button onClick={() => dispatch(increment())} variant="primary">
          Increment
        </Button>
        <Button onClick={() => dispatch(decrement())} variant="secondary">
          Decrement
        </Button>
        <Button
          onClick={() => dispatch(incrementByAmount(5))}
          variant="primary"
          size="large"
        >
          +5
        </Button>
        <Button
          onClick={() => dispatch(reset())}
          variant="secondary"
          size="small"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
