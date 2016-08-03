import { createSelector } from 'reselect';

import { List, Map } from 'immutable';

import Anser from 'anser';
import classNames from 'classnames';

const ansiEnhancer = (line) => {
  return Anser.ansiToJson(
    line.text,
    { use_classes: true }
  ).map((p) => {
    const { content, fg, bg, decoration } = p;
    const classes = classNames({
      [`${fg}`]: !!fg,
      [`${bg}-bg`]: bg,
      [`ansi-${decoration}`]: decoration
    });

    return {
      content,
      classes
    };
  });
};

export const getFile = (state, props) => {
  return props.getTailerState(state).files[props.tailerId];
};

export const getIsLoaded = (state, props) => {
  return !!getFile(state, props);
};

export const getFileSize = (state, props) => {
  const isLoaded = getIsLoaded(state, props);
  return isLoaded
    ? getFile(state, props).fileSize
    : null;
};

export const getLines = (state, props) => {
  const file = getFile(state, props);
  if (file) {
    return file.lines;
  }
  return new List();
};

export const getRequests = (state, props) => (
  props.getTailerState(state).requests[props.tailerId] || new Map()
);

export const getConfig = (state, props) => (
  props.getTailerState(state).config
);

const getEnhancedLine = (line, requests, config) => {
  const enhancedLine = {
    ...line
  };

  if (line.isMissingMarker) {
    enhancedLine.isLoading = requests.has(line.start);
  }

  if (config.parseAnsi && !line.isMissingMarker) {
    enhancedLine.ansi = ansiEnhancer(line);
  }

  return enhancedLine;
};

export const makeGetEnhancedLines = () => {
  return createSelector(
    [getLines, getRequests, getConfig],
    (lines, requests, config) => {
      return lines.map((line) => getEnhancedLine(line, requests, config));
    }
  );
};
