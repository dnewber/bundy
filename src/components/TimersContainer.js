import React, {useState, useRef} from 'react';

import fp from 'lodash/fp';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Container } from '@material-ui/core';
import { Typography, Fab, IconButton } from '@material-ui/core';
import { Card, CardContent, CardActions, CardActionArea, CardHeader } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import { Tooltip } from '@material-ui/core';
import * as Icon from '@material-ui/icons';


const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 24,
  },
  cardRoot: {
    height: 245,
    width: 245,
  },
  cardHeader: {
    height: 0,
  },
  cardContent: {
    height: 142,
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  createTimerContent: {
    background: 'lightgrey',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  copyAnimation: {
    height: 245,
    width: 245
  }
}));

function Timer ({props, updateTimer, deleteTimer}) {
  const classes = useStyles();

  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [autoResume, setAutoResume] = useState(false);
  const [name, setName] = useState(props.name)
  const [editing, setEditing] = useState(false);
  const countRef = useRef(null);

  const handleStart = () => {
    if (isActive) return;
    setIsActive(true)
    countRef.current = setInterval(() => {
      setTimer((timer) => timer + 1)
    }, 1000)
  }

  const handlePause = () => {
    clearInterval(countRef.current)
    setIsActive(false)
  }

  const handleReset = () => {
    clearInterval(countRef.current)
    setIsActive(false)
    setTimer(0)
  }

  const formatTime = () => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)
    return `${getHours}:${getMinutes}:${getSeconds}`
  }

  const formatAltTime = () => {
    const altTime = timer / 3600
    return altTime ? `${altTime}`.slice(0, 4) : '0.00'
  }

  const CopyableTypography = ({text, ...props}) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const notifyCopied = () => {
      setTooltipOpen(true);
      setTimeout(() => { setTooltipOpen(false); }, 1000);
    };
    return (
      <CopyToClipboard text={text} onCopy={notifyCopied}>
        <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          open={tooltipOpen}
          handleTooltopClose={null}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title="Copied!"
        >
          <Typography {...props}>
            {text}
          </Typography>
        </Tooltip>

      </CopyToClipboard>
    )
  }

  const EditableName = () => {
    const editName = (e) => setName(e.target.value)
    const startEditing = () => {
      setEditing(true)
      if (isActive) {
        handlePause()
        setAutoResume(true)
      }
    };
    const finishEditing = () => {
      updateTimer({id: props.id, name});
      setEditing(false)
      if (autoResume) {
        setAutoResume(false)
        handleStart()
      };
    }
    if (editing) {
      return(
        <TextField
          id="outlined-basic" label="Timer Name" variant="outlined" size="small"
          onChange={editName}
          value={name}
          onBlur={finishEditing}
          onKeyPress={(event) => event.key === 'Enter' ? finishEditing() : null}
          inputRef={input => input && input.focus()} // Always autofocus
        />
      )
    }
    return (
      <Typography 
        className={classes.title} 
        color="textSecondary" 
        gutterBottom 
        onClick={startEditing}>
        {name}
      </Typography>
    )
  }

  return (
    <Grid item>
      <Card className={classes.cardRoot}>
        <CardHeader className={classes.cardHeader}
          action={
          <IconButton aria-label="remove" onClick={() => deleteTimer(props.id)}>
            <Icon.Close fontSize="small"/>
          </IconButton>
          }
        >
        </CardHeader>
        <CardContent className={classes.cardContent}>
          <EditableName text={props.name}/>
          <CopyableTypography text={formatTime()} variant="h3" component="h2"/>
          <CopyableTypography text={formatAltTime()} color="textSecondary"/>
        </CardContent>
        <CardActions className={classes.cardActions}>
          <Tooltip title="Reset" placement="right" arrow>
          <Fab size="small" color="default" aria-label="reset" onClick={handleReset}><Icon.TimerOff/></Fab>
        </Tooltip>
          {isActive ? 
            <Fab size="large" color="secondary" aria-label="pause" onClick={handlePause}><Icon.Pause/></Fab>
            :
            <Fab size="large" color="primary" aria-label="start" onClick={handleStart}><Icon.PlayArrow/></Fab>
          }
        </CardActions>
      </Card>
    </Grid>
  )
}


function CreateTimer ({timers, setTimers}) {
  const classes = useStyles();

  const uniqueKey = () => new Date().getTime();
  const createTimer = () => {
      const newTimer = {
        id: uniqueKey(),
        name: "New Timer",
      };
      const timersUpdate = fp.concat(timers, newTimer);
      setTimers(timersUpdate)
  };

  return (
    <Grid item>
      <Card className={classes.cardRoot}>
        <CardActionArea 
          onClick={createTimer}
          className={classes.createTimerContent}
        >
          <Icon.AlarmAdd fontSize="large"/>
        </CardActionArea>
      </Card>
    </Grid>
  )
}


export default function TimersContainer () {
  const classes = useStyles();
  const [timers, setTimers] = useState([]);

  const updateTimer = (toUpdate) => {
    var timersUpdate = timers.map((t) => {
      return t.id === toUpdate.id ? {...t, ...toUpdate} : t;
    });
    setTimers(timersUpdate);
  };

  const deleteTimer = (toDelete) => {
    const timersUpdate = fp.filter(t => t.id !== toDelete, timers);
    setTimers(timersUpdate);
  };

  return (
      <Container maxWidth={false} className={classes.root}>
        <Grid container spacing={2}>
          {
            fp.map(timer =>
              <Timer key={timer.id} props={timer} updateTimer={updateTimer} deleteTimer={deleteTimer}/>
            , timers)
          }
          <CreateTimer timers={timers} setTimers={setTimers} />
        </Grid>
      </Container>
    )
}

