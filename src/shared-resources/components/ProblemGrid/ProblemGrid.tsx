import React, { useMemo } from 'react';
import { DIGIT_PLACES } from '../../../constant/constants';
import Input from '../Input/Input';

type Props = {
  problem: string[][];
  // The key has to be in the format => rowIndex_colIndex
  problemSolution: { [key: string]: number };
  onInputValueChange?: (val: any, rowIndex: number, colIndex: number) => void;
};

const ProblemGrid: React.FC<Props> = ({
  problem,
  problemSolution,
  onInputValueChange,
}) => {
  const longestArrayLength = problem.reduce((len, curr) => {
    if (len < curr.length) {
      return curr.length;
    }
    return len;
  }, 0);

  const digitPlaces = DIGIT_PLACES.slice(0, longestArrayLength).reverse();

  const renderRow = (problemRow: string[], rowIndex: number) =>
    problemRow.map((el, columnIndex) => {
      const key = `${rowIndex}_${columnIndex}`;
      if (el === '$') {
        return <p key={key}> </p>;
      }
      if (el === '_') {
        return (
          <Input
            type='number'
            value={problemSolution[`${rowIndex}_${columnIndex}`] ?? ''}
            onChange={(e) =>
              onInputValueChange?.(e?.target?.value, rowIndex, columnIndex)
            }
            key={key}
            acceptSingleCharacter
            centerAlignText
          />
        );
      }
      return (
        <p
          key={key}
          className='text-center text-4xl font-semibold font-publicSans'
        >
          {el}
        </p>
      );
    });

  return useMemo(
    () => (
      <div className='w-fit'>
        <div className={`grid grid-cols-${longestArrayLength} gap-5 w-fit`}>
          {digitPlaces.map((place) => (
            <p className='text-digitTextColor text-center' key={place}>
              {place}
            </p>
          ))}
          {problem
            .slice(0, problem.length - 1)
            .map((problemRow, index) => renderRow(problemRow, index))}
        </div>
        <hr className='my-5 border-black' />
        <div className={`grid grid-cols-${longestArrayLength} gap-5 w-fit`}>
          {renderRow(problem[problem.length - 1], problem.length - 1)}
        </div>
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [longestArrayLength, digitPlaces, problem]
  );
};

export default ProblemGrid;
