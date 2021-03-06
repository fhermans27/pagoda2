% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/helpers.R
\name{namedNames}
\alias{namedNames}
\title{Get a vector of the names of an object named by the names themselves. 
This is useful with lapply when passing names of objects as it ensures 
that the output list is also named.}
\usage{
namedNames(g)
}
\arguments{
\item{g}{an objects on which we can call names()}
}
\value{
vector with names of object
}
\description{
Get a vector of the names of an object named by the names themselves. 
This is useful with lapply when passing names of objects as it ensures 
that the output list is also named.
}
