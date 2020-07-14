CREATE TABLE acq.quizlist(
    num int unsigned not null AUTO_INCREMENT,
    quiz text not null,
    answer text not null,
    hint text,
    PRIMARY KEY(num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;