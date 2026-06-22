#ifndef BUFFERED_IO_H
#define BUFFERED_IO_H

#include "IIO.h"

// IIO wrapper that returns a pre-loaded string on the first readLine(), then delegates to the inner IO.
class BufferedIO : public IIO {
    IIO& m_inner;
    std::string m_buffered;
    bool m_consumed = false;

public:
    BufferedIO(IIO& inner, const std::string& buffered)
        : m_inner(inner), m_buffered(buffered) {}

    std::string readLine() override {
        if (!m_consumed) {
            m_consumed = true;
            return m_buffered;
        }
        return m_inner.readLine();
    }

    void writeLine(std::string msg) override {
        m_inner.writeLine(msg);
    }
};

#endif
