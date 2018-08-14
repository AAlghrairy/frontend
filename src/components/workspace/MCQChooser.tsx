import { Button, Card, Intent } from '@blueprintjs/core'
import * as React from 'react'

import { showSuccessMessage, showWarningMessage } from '../../utils/notification'
import { IMCQQuestion } from '../assessment/assessmentShape'
import Markdown from '../commons/Markdown'

export interface IMCQChooserProps {
  mcq: IMCQQuestion
  handleMCQSubmit: (choiceId: number) => void
}

type State = {
  mcqOption: number | null
}

class MCQChooser extends React.PureComponent<IMCQChooserProps, State> {
  constructor(props: IMCQChooserProps) {
    super(props)
    this.state = {
      mcqOption: props.mcq.answer
    }
  }
  public render() {
    const options = this.props.mcq.choices.map((choice, i) => (
      <Button
        key={i}
        className="mcq-option col-xs-12"
        active={i === this.state.mcqOption}
        intent={this.getButtonIntent(i, this.state.mcqOption, this.props.mcq.solution)}
        onClick={this.onButtonClickFactory(i)}
        minimal={true}
      >
        <Markdown content={choice.content} />
      </Button>
    ))
    return (
      <div className="MCQChooser row">
        <Card className="mcq-content-parent col-xs-12 middle-xs">
          <div className="row mcq-options-parent between-xs">{options}</div>
        </Card>
      </div>
    )
  }

  /**
   * A function to generate an onClick function that causes
   * and mcq submission with a given answer id.
   *
   * Post-condition: the local state will be updated to store the
   * mcq option selected, and a notification will be displayed with
   * a hint, if the question is ungraded.
   *
   * @param i the id of the answer
   */
  private onButtonClickFactory = (i: number) => (e: any) => {
    if (i !== this.state.mcqOption) {
      this.props.handleMCQSubmit(i)
      this.setState({
        mcqOption: i
      })
    }
    const shouldDisplayMessage = this.props.mcq.solution && this.props.mcq.choices[i].hint
    if (shouldDisplayMessage) {
      const hintElement = <Markdown content={this.props.mcq.choices[i].hint!} />
      if (i === this.props.mcq.solution) {
        showSuccessMessage(hintElement, 4000)
      } else {
        showWarningMessage(hintElement, 4000)
      }
    }
  }

  /**
   * Handles the logic for what intent an MCQ option should show up as.
   * This is dependent on the presence of an actual solution (for ungraded assessments),
   * the current selection, and whether the selected option is active.
   *
   * @param currentOption the current button key, corresponding to a choice ID
   * @param chosenOption the mcq option that is chosen in the state, i.e what should show up as "selected"
   * @param solution the solution to the mcq, if any
   */
  private getButtonIntent = (
    currentOption: number,
    chosenOption: number | null,
    solution: number | null
  ): Intent => {
    const active = currentOption === chosenOption
    const correctOptionSelected = active && solution && currentOption === solution
    if (!solution) {
      return Intent.NONE
    } else if (active && correctOptionSelected) {
      return Intent.SUCCESS
    } else if (active && !correctOptionSelected) {
      return Intent.DANGER
    } else {
      return Intent.NONE
    }
  }
}

export default MCQChooser