import { default as NextLink } from "next/link";
import Layout from "../../components/Layout";
import EditionTalks from "../../components/EditionTalks";
import {
  makeStyles,
  createStyles,
  Theme,
  Typography,
  Link,
  Chip,
  Container,
  Grid,
  Button,
  Box,
  Paper
} from "@material-ui/core";
import {
  OpenInNew as LinkIcon,
  Stars as DistinctiveIcon,
  Payment as TicketIcon
} from "@material-ui/icons";
import { EventEdition } from "../../schema";
import Database from "../../services/Database";
import { NextPage, NextPageContext } from "next";
import Breadcrumbs from "../../components/Breadcrumbs";
import CATEGORIES from "../../constants/categories";
import { useContext } from "react";
import { StackContext } from "../../components/context-providers/StackContextProvider";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2)
    },
    logo: {
      maxWidth: "50%",
      height: theme.typography.fontSize * 4
    },
    chip: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
      marginTop: theme.spacing(0.5),
      "&:first-child": {
        marginLeft: theme.spacing(1)
      }
    },
    chipCategory: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
      marginTop: theme.spacing(0.5)
    },
    description: {
      whiteSpace: "pre-line"
    },
    distinctiveContainer: {
      width: "100%",
      background: `linear-gradient(35deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.light} 100%)`,
      padding: theme.spacing(2),
      margin: theme.spacing(2, 0),
      color: theme.palette.background.default
    },
    externalLinkIcon: {
      fontSize: theme.typography.fontSize
    },
    icon: {
      marginLeft: theme.spacing(1)
    }
  })
);

interface Props {
  edition: EventEdition;
}

const EditionDetails: NextPage<Props> = ({ edition }) => {
  const { state: stateStack } = useContext(StackContext);
  const classes = useStyles({});

  const showTickets = (): boolean => {
    if (!edition.ticketsUrl) return false;
    if (edition.status !== "published-notalks") return false;
    const currentDate = new Date();
    const editionDate = new Date(edition.startDate);
    if (editionDate.getTime() > currentDate.getTime()) return true;
    else return false;
  };

  const shortDate = (date: string) => {
    const startDate = new Date(date);
    var options = {
      month: "short",
      day: "numeric"
    };
    return startDate.toLocaleDateString(undefined, options);
  };

  const breadcrumbs = [
    {
      path: edition.eventId,
      title: edition.eventTitle
    },
    {
      title: edition.title
    }
  ];

  return (
    <Layout
      title={`${edition.eventTitle} ${edition.title}`}
      description={edition.description}
      keywords={`${edition.topTags &&
        edition.topTags.join(
          ","
        )},react event,react conference,developer conference`}
    >
      <Breadcrumbs items={breadcrumbs} />
      <Container className={classes.container}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <img
                  className={classes.logo}
                  src={`${process.env.STORAGE_PATH}${encodeURIComponent(
                    edition.logo
                  )}?alt=media`}
                  alt="Event logo"
                />
                <Typography variant="h1" component="h1" paragraph>
                  {edition.eventTitle} {edition.title}
                </Typography>
                <NextLink href="/[eventid]" as={`/${edition.eventId}`} passHref>
                  <Button color="primary">
                    View all {edition.eventTitle} events
                  </Button>
                </NextLink>
              </Grid>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  alignItems="center"
                  marginTop={1}
                  flexWrap="wrap"
                >
                  {edition.durationMinutes > 0 ? (
                    <Typography variant="body1">
                      {(edition.durationMinutes / 60).toFixed(0)} hours of
                      content in&nbsp;
                    </Typography>
                  ) : (
                    <>Event category:&nbsp;&nbsp;</>
                  )}
                  {edition.categories
                    .map(cat => (
                      <span key={cat}>
                        {CATEGORIES.find(category => cat === category.id) &&
                          CATEGORIES.find(category => cat === category.id)
                            .title}
                      </span>
                    ))
                    .reduce((previous, current) => (
                      <>
                        {previous}, {current}
                      </>
                    ))}
                  {edition.tags && (
                    <>
                      <span>&nbsp;&nbsp;</span>
                      {edition.tags.map(
                        (tag, index) =>
                          tag.count > 1 && (
                            <NextLink
                              key={index}
                              passHref
                              href={`/topic/[topicid]${
                                stateStack.slug
                                  ? `?stack=${stateStack.slug}`
                                  : ""
                              }`}
                              as={`/topic/${tag.label.toLowerCase()}${
                                stateStack.slug
                                  ? `?stack=${stateStack.slug}`
                                  : ""
                              }`}
                            >
                              <Chip
                                component="a"
                                color="primary"
                                variant="outlined"
                                size="small"
                                key={index}
                                label={tag.label}
                                className={classes.chip}
                              />
                            </NextLink>
                          )
                      )}
                    </>
                  )}{" "}
                  {edition.durationMinutes > 0 && <>and more.</>}
                </Box>
              </Grid>
              {showTickets() && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="secondary"
                    href={edition.ticketsUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    Buy tickets
                    <TicketIcon className={classes.icon} />
                  </Button>
                </Grid>
              )}
              {edition.isDistinctive && (
                <Paper className={classes.distinctiveContainer}>
                  <Box display="flex" alignItems="center">
                    <DistinctiveIcon />
                    &nbsp;
                    <Typography variant="h6">Distinctive event</Typography>
                  </Box>
                  <Typography variant="body2">
                    This event has superior content and excellent audio / video
                    quality. The Editor's Choice talks are only the beginning.
                    We're confident that you'll enjoy most of the content.
                  </Typography>
                </Paper>
              )}
              <Grid item xs={12}>
                <Typography variant="h5" component="h2">
                  Event info
                </Typography>
                <Typography variant="overline">
                  {shortDate(edition.startDate)}&ndash;
                  {shortDate(edition.endDate)} | {edition.state || edition.city}
                  , {edition.country}
                </Typography>
                <Typography variant="body1" className={classes.description}>
                  {edition.description}
                </Typography>
                <p>
                  <Link
                    href={edition.website}
                    color="textSecondary"
                    target="_blank"
                    variant="body2"
                  >
                    Official website{" "}
                    <LinkIcon className={classes.externalLinkIcon} />
                  </Link>
                </p>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            {edition.talks && edition.talks.length > 0 ? (
              <EditionTalks edition={edition} />
            ) : (
              <Typography variant="caption" color="textSecondary">
                No talks have been added to this event, yet.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

// TODO implement this
const EditionHighlights = ({ edition }: { edition: EventEdition }) => {
  const iframe = `<iframe
                    width="100%"
                    height="400"
                    src="https://www.youtube-nocookie.com/embed/7S_7fKLgjXU?autoplay=1&mute=1&loop=1&controls=0&disablekb=1&modestbranding=1"
                    frameborder="0"
                    allow="autoplay;encrypted-media"
                  />`;

  return <div dangerouslySetInnerHTML={{ __html: iframe }} />;
};

interface QueryProps {
  eventid: string;
  editionid: string;
}
EditionDetails.getInitialProps = async (ctx: NextPageContext) => {
  const { eventid, editionid } = (ctx.query as unknown) as QueryProps;
  const edition = await Database.getEdition(eventid, editionid);
  return { edition };
};

export default EditionDetails;
